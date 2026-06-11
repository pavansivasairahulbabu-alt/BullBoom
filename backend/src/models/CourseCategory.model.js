import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Category description is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📚',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    estimatedHours: {
      type: Number,
      default: 5,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CourseCategory = mongoose.model('CourseCategory', courseCategorySchema);
export default CourseCategory;
