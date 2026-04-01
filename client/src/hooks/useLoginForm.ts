import { useMemo, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";

type LoginValues = {
  email: string;
  password: string;
  remember: boolean;
};

type TouchedState = Record<keyof LoginValues, boolean>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildTouched = (value: boolean): TouchedState => ({
  email: value,
  password: value,
  remember: value,
});

export const useLoginForm = (initialValues?: Partial<LoginValues>) => {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    remember: false,
    ...initialValues,
  });
  const [touched, setTouched] = useState<TouchedState>(buildTouched(false));

  const errors = useMemo(() => {
    const next: Partial<Record<keyof LoginValues, string>> = {};
    if (!values.email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.password) {
      next.password = "Password is required.";
    } else if (values.password.length < 6) {
      next.password = "Password should be at least 6 characters.";
    }
    return next;
  }, [values.email, values.password]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const markAllTouched = () => setTouched(buildTouched(true));

  const reset = () => {
    setValues({
      email: "",
      password: "",
      remember: false,
    });
    setTouched(buildTouched(false));
  };

  return {
    values,
    setValues,
    touched,
    errors,
    isValid,
    handleChange,
    handleBlur,
    markAllTouched,
    reset,
  };
};
