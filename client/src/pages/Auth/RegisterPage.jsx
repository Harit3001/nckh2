import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function RegisterPage() {
    const navigate = useNavigate();

    const {
        registerPatient,
        registerDoctor
    } = useAuth();

    const [role, setRole] = useState("PATIENT");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",

        dob: "",
        bloodType: "",
        allergyInfo: "",
        nationalId: "",

        doctorCode: "",
        speciality: "",
        hospitalId: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setErrors({});
    };

    const handleChangeField = (
        field,
        value
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
            message: "",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName =
                "Vui lòng nhập họ tên";
        }

        if (!formData.email.trim()) {
            newErrors.email =
                "Vui lòng nhập email";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email
            )
        ) {
            newErrors.email =
                "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password =
                "Vui lòng nhập mật khẩu";
        } else if (
            formData.password.length < 6
        ) {
            newErrors.password =
                "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Vui lòng xác nhận mật khẩu";
        } else if (
            formData.password !==
            formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Mật khẩu xác nhận không khớp";
        }

        if (role === "PATIENT") {
            if (!formData.dob) {
                newErrors.dob =
                    "Vui lòng chọn ngày sinh";
            }

            if (!formData.bloodType) {
                newErrors.bloodType =
                    "Vui lòng chọn nhóm máu";
            }

            if (
                !formData.allergyInfo.trim()
            ) {
                newErrors.allergyInfo =
                    "Vui lòng nhập thông tin dị ứng";
            }

            if (
                !formData.nationalId.trim()
            ) {
                newErrors.nationalId =
                    "Vui lòng nhập số CCCD/CMND";
            }
        } else {
            if (
                !formData.doctorCode.trim()
            ) {
                newErrors.doctorCode =
                    "Vui lòng nhập mã bác sĩ";
            } else if (
                !/^BS\d{6,}$/i.test(
                    formData.doctorCode.trim()
                )
            ) {
                newErrors.doctorCode =
                    "Mã bác sĩ phải đúng định dạng (VD: BS000001)";
            }

            if (
                !formData.speciality.trim()
            ) {
                newErrors.speciality =
                    "Vui lòng nhập chuyên khoa";
            }

            if (
                !formData.hospitalId ||
                isNaN(
                    Number(
                        formData.hospitalId
                    )
                )
            ) {
                newErrors.hospitalId =
                    "Vui lòng nhập ID bệnh viện hợp lệ";
            }
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors)
                .length === 0
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);

            if (role === "PATIENT") {
                await registerPatient({
                    email:
                        formData.email.trim(),
                    password:
                        formData.password.trim(),
                    fullName:
                        formData.fullName.trim(),
                    dob:
                        formData.dob,
                    bloodType:
                        formData.bloodType,
                    allergyInfo:
                        formData.allergyInfo.trim(),
                    nationalId:
                        formData.nationalId.trim(),
                });
            } else {
                await registerDoctor({
                    email:
                        formData.email.trim(),
                    password:
                        formData.password.trim(),
                    fullName:
                        formData.fullName.trim(),
                    doctorCode:
                        formData.doctorCode
                            .trim()
                            .toUpperCase(),
                    speciality:
                        formData.speciality.trim(),
                    hospitalId:
                        Number(
                            formData.hospitalId
                        ),
                });
            }

            alert(
                "Đăng ký tài khoản thành công! Vui lòng đăng nhập."
            );

            navigate("/login");
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                message:
                    error.message ||
                    "Đăng ký thất bại",
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <RegisterForm
            role={role}
            onRoleChange={handleRoleChange}
            fullName={
                formData.fullName
            }
            email={
                formData.email
            }
            password={
                formData.password
            }
            confirmPassword={
                formData.confirmPassword
            }
            dob={
                formData.dob
            }
            bloodType={
                formData.bloodType
            }
            allergyInfo={
                formData.allergyInfo
            }
            nationalId={
                formData.nationalId
            }
            doctorCode={
                formData.doctorCode
            }
            speciality={
                formData.speciality
            }
            hospitalId={
                formData.hospitalId
            }
            errors={errors}
            loading={loading}
            onChangeField={
                handleChangeField
            }
            onSubmit={
                handleSubmit
            }
        />
    );
}

export default RegisterPage;
