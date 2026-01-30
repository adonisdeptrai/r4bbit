import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Button } from '../../components/common'; // Assuming we have this
// If we don't have a reusable Input/Select, I'll style them directly or create local ones.

const AddProduct = () => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Automation Script',
        price: 0,
        originalPrice: 0,
        platform: 'Node Native',
        rating: 5,
        reviewsCount: 0,
        description: '',
        image: null as File | null
    });
    const [features, setFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFeatures(prev => [...prev, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFeatures(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('type', formData.type);
        data.append('price', formData.price.toString());
        data.append('originalPrice', formData.originalPrice.toString());
        data.append('platform', formData.platform);
        data.append('rating', formData.rating.toString());
        data.append('reviewsCount', formData.reviewsCount.toString());
        data.append('description', formData.description);
        data.append('features', JSON.stringify(features));
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                body: data
            });

            if (response.ok) {
                alert('Product created successfully!');
                // Reset form
                setFormData({
                    title: '',
                    type: 'Automation Script',
                    price: 0,
                    originalPrice: 0,
                    platform: 'Node Native',
                    rating: 5,
                    reviewsCount: 0,
                    description: '',
                    image: null
                });
                setFeatures([]);
                setImagePreview(null);
            } else {
                const error = await response.json();
                alert('Error creating product: ' + error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    // Shared input styles
    const inputClasses = "w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all placeholder:text-slate-600";
    const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-20 px-4 flex justify-center items-start">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl bg-[#0b1121]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background gradient */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <h1 className="text-3xl font-bold text-white mb-8 relative z-10">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                    {/* Image Upload */}
                    <div>
                        <label className={labelClasses}>Product Image</label>
                        <div className="flex gap-6 items-start">
                            {imagePreview && (
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-brand-cyan/50 hover:bg-white/5 transition-all group">
                                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-brand-cyan transition-colors">
                                        <Upload size={20} />
                                        <span className="font-medium text-sm">Click to upload image</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!imagePreview} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Title & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="Product Name"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Category</label>
                            <div className="relative">
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="Automation Script">Automation Script</option>
                                    <option value="MMO Tool">MMO Tool</option>
                                    <option value="Course">Course</option>
                                    <option value="License Key">License Key</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Price & Original Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className={inputClasses}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Original Price ($)</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                className={inputClasses}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <label className={labelClasses}>Platform ID</label>
                        <div className="relative">
                            <select
                                name="platform"
                                value={formData.platform}
                                onChange={handleChange}
                                className={`${inputClasses} appearance-none cursor-pointer`}
                            >
                                <option value="Node Native">Node Native</option>
                                <option value="Browser JS">Browser JS</option>
                                <option value="Python Script">Python Script</option>
                                <option value="Windows Executable">Windows Executable</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Rating (0-5)</label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                className={inputClasses}
                                min="0"
                                max="5"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Reviews Count</label>
                            <input
                                type="number"
                                name="reviewsCount"
                                value={formData.reviewsCount}
                                onChange={handleChange}
                                className={inputClasses}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelClasses}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`${inputClasses} min-h-[120px] resize-y`}
                            placeholder="Detailed product description..."
                            required
                        />
                    </div>

                    {/* Key Features */}
                    <div>
                        <label className={labelClasses}>Key Features</label>
                        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-2 mb-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    className="bg-transparent flex-1 px-3 py-2 text-white focus:outline-none placeholder:text-slate-600"
                                    placeholder="Add a feature..."
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="bg-brand-cyan text-black p-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg pl-3 pr-2 py-1.5 text-sm text-slate-300">
                                        <span>{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(idx)}
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-cyan text-black hover:bg-[#5ff5ff] font-bold h-14 rounded-xl text-lg shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] mt-8"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Product'}
                    </Button>

                </form>
            </motion.div>
        </div>
    );
};

export default AddProduct;
