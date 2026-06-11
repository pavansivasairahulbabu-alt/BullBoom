import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      required: [true, 'Course duration is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: [true, 'Course difficulty is required'],
    },
    price: {
      type: String,
      default: 'Free',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    students: {
      type: Number,
      default: 0,
    },
    lessons: {
      type: [
        {
          title: String,
          duration: String,
          videoUrl: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
