import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User as UserIcon, MessageSquare, ShoppingBag, Loader } from 'lucide-react';
import { ReviewsAPI, AppSettingsAPI, Review } from '../config/supabaseApi';
import { Button } from './common';
import { useAuth } from '../contexts/AuthContext';

interface ProductReviewsProps {
    productId: string;
    productTitle: string;
}

const StarRating = ({
    rating,
    onRatingChange,
    interactive = false,
    size = 16
}: {
    rating: number;
    onRatingChange?: (r: number) => void;
    interactive?: boolean;
    size?: number;
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onRatingChange?.(star)}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <Star
                        size={size}
                        className={`${star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
};

const ReviewItem = ({ review }: { review: Review }) => {
    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/10">
                    {review.avatar ? (
                        <img src={review.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <UserIcon size={18} className="text-slate-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-white text-sm truncate">{review.username}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} size={12} />
                    {review.comment && (
                        <p className="mt-2 text-sm text-slate-300 leading-relaxed">{review.comment}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productTitle }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [canReview, setCanReview] = useState(false);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [reviewEnabled, setReviewEnabled] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Check if reviews are enabled
                const enabled = await AppSettingsAPI.isReviewEnabled();
                setReviewEnabled(enabled);

                if (!enabled) {
                    setLoading(false);
                    return;
                }

                // Fetch reviews
                const fetchedReviews = await ReviewsAPI.getByProduct(productId);
                setReviews(fetchedReviews);

                // Check if user can review
                if (user) {
                    const reviewCheck = await ReviewsAPI.canReview(productId);
                    setCanReview(reviewCheck.canReview);
                    if (reviewCheck.existingReview) {
                        setMyReview(reviewCheck.existingReview);
                    }
                }
            } catch (error) {
                console.error('Failed to load reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [productId, user]);

    const handleSubmitReview = async () => {
        if (!user || submitting) return;

        setSubmitting(true);
        try {
            const newReview = await ReviewsAPI.create(productId, newRating, newComment);
            setReviews(prev => [newReview, ...prev]);
            setMyReview(newReview);
            setCanReview(false);
            setShowForm(false);
            setNewComment('');
            setNewRating(5);
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            // Show error toast or message
        } finally {
            setSubmitting(false);
        }
    };

    // Don't render if reviews are disabled
    if (!reviewEnabled) return null;

    if (loading) {
        return (
            <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-center py-8">
                    <Loader size={20} className="animate-spin text-brand-cyan" />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={14} />
                    Customer Reviews ({reviews.length})
                </h3>
                {canReview && !showForm && (
                    <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20 border border-brand-cyan/20 text-xs"
                    >
                        <Star size={12} className="mr-1" /> Write Review
                    </Button>
                )}
            </div>

            {/* Write Review Form */}
            <AnimatePresence>
                {showForm && canReview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="p-4 bg-brand-cyan/5 rounded-xl border border-brand-cyan/20 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-2 block">Your Rating</label>
                                <StarRating
                                    rating={newRating}
                                    onRatingChange={setNewRating}
                                    interactive={true}
                                    size={24}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-2 block">Your Review (Optional)</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`Share your experience with ${productTitle}...`}
                                    className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all min-h-[80px] resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className="bg-brand-cyan text-black hover:bg-[#5ff5ff] font-bold text-xs"
                                >
                                    {submitting ? (
                                        <Loader size={14} className="animate-spin mr-1" />
                                    ) : (
                                        <Send size={14} className="mr-1" />
                                    )}
                                    Submit Review
                                </Button>
                                <Button
                                    onClick={() => setShowForm(false)}
                                    variant="ghost"
                                    className="text-slate-400 hover:text-white text-xs"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* My Existing Review */}
            {myReview && (
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest mb-2">Your Review</p>
                    <ReviewItem review={myReview} />
                </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
                    {reviews.filter(r => r.id !== myReview?.id).slice(0, 5).map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}
                    {reviews.length > 5 && (
                        <p className="text-xs text-slate-500 text-center py-2">
                            +{reviews.length - 5} more reviews
                        </p>
                    )}
                </div>
            ) : !myReview && (
                <div className="text-center py-6 text-slate-500">
                    <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No reviews yet</p>
                    {!user && (
                        <p className="text-xs mt-1">Sign in and purchase to leave a review</p>
                    )}
                    {user && !canReview && !myReview && (
                        <p className="text-xs mt-1 flex items-center justify-center gap-1">
                            <ShoppingBag size={12} /> Purchase this product to leave a review
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
