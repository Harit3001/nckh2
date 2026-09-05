import { Link } from "react-router-dom";

export default function Register({
    role,
    onRoleChange,

    fullName,
    email,
    password,
    confirmPassword,

    dob,
    bloodType,
    allergyInfo,
    nationalId,

    doctorCode,
    speciality,
    hospitalId,

    errors = {},
    loading = false,

    onChangeField,
    onSubmit,
}) {
    const globalError =
        errors.message || errors.Message;

    return (
        <div className="register-page">

            <span className="bubble b1"></span>
            <span className="bubble b2"></span>
            <span className="bubble b3"></span>
            <span className="bubble b4"></span>
            <span className="bubble b5"></span>

            <form
                className="register-box"
                onSubmit={onSubmit}
                noValidate
            >

                <h1>Đăng ký tài khoản</h1>

                <div className="form-group">
                    <select
                        className="select-input role-select"
                        value={role}
                        onChange={(e) =>
                            onRoleChange(e.target.value)
                        }
                    >
                        <option value="PATIENT">
                            Bệnh nhân
                        </option>

                        <option value="DOCTOR">
                            Bác sĩ
                        </option>
                    </select>
                </div>


                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) =>
                            onChangeField(
                                "fullName",
                                e.target.value
                            )
                        }
                    />

                    {errors.fullName && (
                        <p className="error">
                            {errors.fullName}
                        </p>
                    )}
                </div>


                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            onChangeField(
                                "email",
                                e.target.value
                            )
                        }
                    />

                    {errors.email && (
                        <p className="error">
                            {errors.email}
                        </p>
                    )}
                </div>

                {role === "PATIENT" && (
                    <>
                        <div className="form-group">
                            <label className="field-label">
                                Ngày sinh
                            </label>

                            <input
                                type="date"
                                value={dob}
                                onChange={(e) =>
                                    onChangeField(
                                        "dob",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.dob && (
                                <p className="error">
                                    {errors.dob}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <select
                                className="select-input"
                                value={bloodType}
                                onChange={(e) =>
                                    onChangeField(
                                        "bloodType",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Chọn nhóm máu
                                </option>

                                <option value="O+">
                                    O+
                                </option>

                                <option value="O-">
                                    O-
                                </option>

                                <option value="A+">
                                    A+
                                </option>

                                <option value="A-">
                                    A-
                                </option>

                                <option value="B+">
                                    B+
                                </option>

                                <option value="B-">
                                    B-
                                </option>

                                <option value="AB+">
                                    AB+
                                </option>

                                <option value="AB-">
                                    AB-
                                </option>
                            </select>

                            {errors.bloodType && (
                                <p className="error">
                                    {errors.bloodType}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Thông tin dị ứng (ví dụ: Không có)"
                                value={allergyInfo}
                                onChange={(e) =>
                                    onChangeField(
                                        "allergyInfo",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.allergyInfo && (
                                <p className="error">
                                    {errors.allergyInfo}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Số CCCD / CMND"
                                value={nationalId}
                                onChange={(e) =>
                                    onChangeField(
                                        "nationalId",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.nationalId && (
                                <p className="error">
                                    {errors.nationalId}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {role === "DOCTOR" && (
                    <>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Mã bác sĩ (VD: BS000001)"
                                value={doctorCode}
                                onChange={(e) =>
                                    onChangeField(
                                        "doctorCode",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.doctorCode && (
                                <p className="error">
                                    {errors.doctorCode}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Chuyên khoa (VD: Tim mạch)"
                                value={speciality}
                                onChange={(e) =>
                                    onChangeField(
                                        "speciality",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.speciality && (
                                <p className="error">
                                    {errors.speciality}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <input
                                type="number"
                                placeholder="ID Bệnh viện (VD: 1)"
                                value={hospitalId}
                                onChange={(e) =>
                                    onChangeField(
                                        "hospitalId",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.hospitalId && (
                                <p className="error">
                                    {errors.hospitalId}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                        value={password}
                        onChange={(e) =>
                            onChangeField(
                                "password",
                                e.target.value
                            )
                        }
                    />

                    {errors.password && (
                        <p className="error">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) =>
                            onChangeField(
                                "confirmPassword",
                                e.target.value
                            )
                        }
                    />

                    {errors.confirmPassword && (
                        <p className="error">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>


                {globalError && (
                    <p className="error global-error">
                        {globalError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Đang xử lý..."
                        : role === "PATIENT"
                            ? "Đăng ký bệnh nhân"
                            : "Đăng ký bác sĩ"}
                </button>

                <p className="signup">
                    Đã có tài khoản?{" "}

                    <Link to="/login">
                        Đăng nhập
                    </Link>
                </p>

            </form>
        </div>
    );
}
