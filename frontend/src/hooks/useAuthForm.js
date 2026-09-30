import { useState } from "react";

export default function useAuthForm({ initialValues, validate, onSubmit }) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ loading: false, error: "" });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const found = validate(values);
        setErrors(found);
        if (Object.keys(found).length) return;
        setStatus({ loading: true, error: "" });
        try {
            await onSubmit(values);
        } catch (error) {
            setStatus({ loading: false, error: error.message });
        }
    };

    return { values, errors, status, handleChange, handleSubmit };
}