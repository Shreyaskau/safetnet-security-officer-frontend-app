import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const broadcastSchema = yup.object().shape({
  message: yup
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must not exceed 500 characters')
    .required('Message is required'),
  alertType: yup
    .string()
    .oneOf(['general', 'warning', 'emergency'], 'Invalid alert type')
    .required('Alert type is required'),
});














