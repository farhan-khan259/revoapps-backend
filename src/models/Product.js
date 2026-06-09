import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  sold: { type: Number, min: 0, default: 0 },
  stock: { type: Number, min: 0, default: 0 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  highlights: [{ type: String, trim: true }],
  specs: [
    {
      label: { type: String, trim: true },
      value: { type: String, trim: true },
    },
  ],
  images: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
