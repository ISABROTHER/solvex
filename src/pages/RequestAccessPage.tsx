// src/pages/RequestAccessPage.tsx
// ... imports ...

const requestAccessSchema = z.object({
  firstName: z.string().min(1, 'First name is required'), // Changed from name
  lastName: z.string().min(1, 'Last name is required'), // Added lastName
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
  reason: z.string().min(10, 'Please provide a brief reason (min 10 characters)').optional(),
});
type RequestAccessFormData = z.infer<typeof requestAccessSchema>;

// ... rest of component ...