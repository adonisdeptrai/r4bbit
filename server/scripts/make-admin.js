/**
 * Script to promote a user to admin role
 * Usage: node scripts/make-admin.js <email>
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');

async function makeAdmin(email) {
    try {
        // Update user role to admin
        const { data, error } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', email)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            console.error(`❌ User with email "${email}" not found`);
            return;
        }

        console.log('✅ User promoted to admin successfully!');
        console.log(data[0]);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
}

makeAdmin(email);
