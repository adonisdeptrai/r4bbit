const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const nod

emailer = require('nodemailer');

// Helper function to send email notifications
async function sendTicketEmail(to, subject, htmlContent) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('SMTP not configured, skipping email');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Ticket email sent to ${to}`);
    } catch (err) {
        console.error('Error sending ticket email:', err);
    }
}

//GET /api/tickets/my-tickets - Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { data: tickets, error, count } = await supabase
            .from('tickets')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

        if (error) throw error;

        res.json({
            tickets,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (err) {
        console.error('Get My Tickets Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/tickets - Create new ticket
router.post('/', auth, async (req, res) => {
    try {
        const { subject, category, priority, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create ticket
        const { data: ticket, error } = await supabase
            .from('tickets')
            .insert([{
                user_id: user.id,
                subject,
                category: category || 'Other',
                priority: priority || 'Medium',
                status: 'Open',
                messages: [{
                    sender: user.username,
                    senderRole: 'user',
                    message,
                    timestamp: new Date().toISOString()
                }]
            }])
            .select()
            .single();

        if (error) throw error;

        // Send email to admin (optional - could be configured in settings)
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (adminEmail) {
            const emailHtml = `
                <h1>New Support Ticket</h1>
                <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
                <p><strong>From:</strong> ${user.username} (${user.email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Category:</strong> ${category || 'Other'}</p>
                <p><strong>Priority:</strong> ${priority || 'Medium'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                <p><a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/admin?tab=tickets">View in Admin Dashboard</a></p>
            `;

            await sendTicketEmail(
                adminEmail,
                `New Ticket: ${subject} [${ticket.ticket_id}]`,
                emailHtml
            );
        }

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket
        });
    } catch (err) {
        console.error('Create Ticket Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/tickets/:id - Get ticket details
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        let { data: ticket } = await supabase
            .from('tickets')
            .select(`
                *,
                users:user_id(id, username, email),
                assigned_users:assigned_to(id, username)
            `)
            .eq('id', id)
            .single();

        // Also try to find by ticket_id if not found by UUID
        if (!ticket) {
            const { data: ticketByTicketId } = await supabase
                .from('tickets')
                .select(`
                    *,
                    users:user_id(id, username, email),
                    assigned_users:assigned_to(id, username)
                `)
                .eq('ticket_id', id)
                .single();
            ticket = ticketByTicketId;
        }

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Authorization: User can only see own tickets, admin can see all
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (user.role !== 'admin' && ticket.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ ticket });
    } catch (err) {
        console.error('Get Ticket Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/tickets/:id/reply - Add message to ticket
router.post('/:id/reply', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        let { data: ticket } = await supabase
            .from('tickets')
            .select(`
                *,
                users:user_id(id, username, email)
            `)
            .eq('id', id)
            .single();

        if (!ticket) {
            const { data: ticketByTicketId } = await supabase
                .from('tickets')
                .select(`
                    *,
                    users:user_id(id, username, email)
                `)
                .eq('ticket_id', id)
                .single();
            ticket = ticketByTicketId;
        }

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        // Authorization check
        if (user.role !== 'admin' && ticket.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Add message
        const newMessages = [
            ...(ticket.messages || []),
            {
                sender: user.username,
                senderRole: user.role === 'admin' ? 'admin' : 'user',
                message: message.trim(),
                timestamp: new Date().toISOString()
            }
        ];

        const { data: updatedTicket, error } = await supabase
            .from('tickets')
            .update({
                messages: newMessages,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticket.id)
            .select()
            .single();

        if (error) throw error;

        // Send email notification
        const isAdminReply = user.role === 'admin';
        const recipientEmail = isAdminReply ? ticket.users.email : process.env.ADMIN_EMAIL;

        if (recipientEmail) {
            const emailHtml = `
                <h1>New Reply on Ticket ${ticket.ticket_id}</h1>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p><strong>From:</strong> ${user.username}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                <p><a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/${isAdminReply ? 'dashboard' : 'admin'}?tab=tickets&ticket=${ticket.id}">View Ticket</a></p>
            `;

            await sendTicketEmail(
                recipientEmail,
                `Reply on Ticket ${ticket.ticket_id}: ${ticket.subject}`,
                emailHtml
            );
        }

        res.json({
            message: 'Reply added successfully',
            ticket: updatedTicket
        });
    } catch (err) {
        console.error('Reply Ticket Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/tickets/:id/status - Change ticket status (Admin only)
router.put('/:id/status', [auth, adminAuth], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let { data: ticket } = await supabase
            .from('tickets')
            .select(`
                *,
                users:user_id(email, username)
            `)
            .eq('id', id)
            .single();

        if (!ticket) {
            const { data: ticketByTicketId } = await supabase
                .from('tickets')
                .select(`
                    *,
                    users:user_id(email, username)
                `)
                .eq('ticket_id', id)
                .single();
            ticket = ticketByTicketId;
        }

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const oldStatus = ticket.status;

        const { data: admin } = await supabase
            .from('users')
            .select('username')
            .eq('id', req.user.id)
            .single();

        // Add system message for status change
        const newMessages = [
            ...(ticket.messages || []),
            {
                sender: admin.username,
                senderRole: 'admin',
                message: `Status changed from "${oldStatus}" to "${status}"`,
                timestamp: new Date().toISOString()
            }
        ];

        const { data: updatedTicket, error } = await supabase
            .from('tickets')
            .update({
                status,
                messages: newMessages,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticket.id)
            .select()
            .single();

        if (error) throw error;

        // Send email to user
        if (ticket.users && ticket.users.email) {
            const emailHtml = `
                <h1>Ticket Status Updated</h1>
                <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p><strong>Status:</strong> ${oldStatus} → <strong>${status}</strong></p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                <p><a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/dashboard?tab=tickets&ticket=${ticket.id}">View Ticket</a></p>
            `;

            await sendTicketEmail(
                ticket.users.email,
                `Ticket ${ticket.ticket_id} Status: ${status}`,
                emailHtml
            );
        }

        res.json({
            message: 'Status updated successfully',
            ticket: updatedTicket
        });
    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/tickets - Get all tickets (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const { status, priority, category, assignedTo, page = 1, limit = 50 } = req.query;

        let query = supabase
            .from('tickets')
            .select(`
                *,
                users:user_id(id, username, email),
                assigned_users:assigned_to(id, username)
            `, { count: 'exact' })
            .order('updated_at', { ascending: false })
            .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (category) query = query.eq('category', category);
        if (assignedTo) query = query.eq('assigned_to', assignedTo);

        const { data: tickets, error, count } = await query;

        if (error) throw error;

        res.json({
            tickets,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (err) {
        console.error('Get All Tickets Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/tickets/:id/assign - Assign ticket to admin (Admin only)
router.put('/:id/assign', [auth, adminAuth], async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;

        let { data: ticket } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (!ticket) {
            const { data: ticketByTicketId } = await supabase
                .from('tickets')
                .select('*')
                .eq('ticket_id', id)
                .single();
            ticket = ticketByTicketId;
        }

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify adminId is a valid admin user
        if (adminId) {
            const { data: adminUser } = await supabase
                .from('users')
                .select('role')
                .eq('id', adminId)
                .single();

            if (!adminUser || adminUser.role !== 'admin') {
                return res.status(400).json({ message: 'Invalid admin user' });
            }
        }

        const { data: updatedTicket, error } = await supabase
            .from('tickets')
            .update({
                assigned_to: adminId || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticket.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Ticket assigned successfully',
            ticket: updatedTicket
        });
    } catch (err) {
        console.error('Assign Ticket Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
