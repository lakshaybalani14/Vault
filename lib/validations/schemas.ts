import { z } from 'zod'
import { ALLOWED_DOMAINS, CLAIM_MESSAGE_MIN_LENGTH } from '@/lib/constants'

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .refine(
      (email) => {
        const domain = email.split('@')[1]
        return ALLOWED_DOMAINS.includes(domain)
      },
      { message: 'Please use your VIT college email address (@vitstudent.ac.in or @vit.ac.in)' }
    ),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be under 72 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const postSchema = z.object({
  type: z.enum(['lost', 'found'], { message: 'Please select Lost or Found' }),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be under 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be under 1000 characters'),
  category: z.string({ message: 'Please select a category' }),
  found_at: z.string({ message: 'Please select a location' }),
  date: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  question: z.string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question must be under 200 characters'),
  answer: z.string()
    .min(1, 'Please provide an answer'),
})

export const claimAnswerSchema = z.object({
  answer: z.string().min(1, 'Please type your answer'),
})

export const claimMessageSchema = z.object({
  message: z.string()
    .min(CLAIM_MESSAGE_MIN_LENGTH, `Message must be at least ${CLAIM_MESSAGE_MIN_LENGTH} characters`)
    .max(500, 'Message must be under 500 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PostInput = z.infer<typeof postSchema>
export type ClaimAnswerInput = z.infer<typeof claimAnswerSchema>
export type ClaimMessageInput = z.infer<typeof claimMessageSchema>
