import { z } from 'zod';

export const signUpSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .refine(
      (email) => email.endsWith('@univ-eloued.dz'),
      'Only @univ-eloued.dz email addresses are allowed'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export const professorProfileSchema = z.object({
  fullNameArabic: z
    .string()
    .min(1, 'Full name in Arabic is required')
    .max(255, 'Full name is too long'),
  fullNameLatin: z
    .string()
    .min(1, 'Full name in Latin is required')
    .max(255, 'Full name is too long'),
  academicRank: z.enum(
    [
      'Professor',
      'Associate Professor A',
      'Associate Professor B',
      'Assistant Professor A',
      'Assistant Professor B',
    ],
    { required_error: 'Academic rank is required' }
  ),
  professionalEmail: z.string().email('Invalid email address'),
  personalEmail: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  primaryPhone: z
    .string()
    .min(1, 'Primary phone number is required')
    .max(50, 'Phone number is too long'),
  secondaryPhone: z
    .string()
    .max(50, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  phdSpecialization: z
    .string()
    .min(1, 'PhD specialization is required'),
  fieldOfResearch: z.string().optional().or(z.literal('')),
  department: z.enum(
    [
      'قسم العلوم الاقتصادية',
      'قسم العلوم المالية والمحاسبة',
      'قسم علوم التسيير',
      'قسم العلوم التجارية',
      'قسم الجذع المشترك',
    ],
    { required_error: 'Department is required' }
  ),
});

export const academicYearSchema = z.object({
  yearName: z.string().min(1, 'Year name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().optional(),
});

export const moduleSchema = z.object({
  moduleName: z.string().min(1, 'Module name is required'),
  studyLevel: z.enum(
    ['جذع مشترك', 'ليسانس', 'ماستر'],
    { required_error: 'Study level is required' }
  ),
  semester: z.string().optional(),
  specialtyId: z.number().optional(),
  isActive: z.boolean().optional(),
});
