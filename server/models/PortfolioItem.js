import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

portfolioItemSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, doc) => {
    const transformed = { ...doc };
    transformed.id = transformed._id?.toString();
    delete transformed._id;
    return transformed;
  }
});

const PortfolioItem = mongoose.models.PortfolioItem || mongoose.model('PortfolioItem', portfolioItemSchema);

export default PortfolioItem;

