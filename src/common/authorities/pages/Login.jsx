// ============================================================================
// 📁 src/common/authorities/pages/Login.jsx
// ============================================================================

import React, { useState, useCallback } from "react";
import { useAuth } from "../component/useAuth";
import { Lock, Mail, User } from "lucide-react";
import ApiClient from "../api/ApiClient";

// =========================================================================
// 비밀번호 초기화 팝업 컴포넌트 (API 연결)
// =========================================================================
const PasswordResetModal = ({ isOpen, onClose }) => {
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // ⭐️ 비밀번호 초기화 요청 API 호출 핸들러
    const handleResetSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setMessage("");

            try {
                // ✅ ApiClient 사용 (JWT 불필요한 public API지만 인터셉터로 통일)
                await ApiClient.post("/auth/password/reset-request", {
                    userId: id,
                    email,
                });

                setMessage("이메일로 비밀번호 재설정 링크가 발송되었습니다. 확인해 주세요.");
                setIsSuccess(true);
            } catch (error) {
                console.error("API 통신 오류:", error);

                const errorMsg =
                    error.response?.data?.message ||
                    error.message ||
                    "비밀번호 초기화 요청에 실패했습니다. 정보를 확인해 주세요.";

                setMessage(errorMsg);
                setIsSuccess(false);
            }
        },
        [id, email]
    );

    // 팝업 닫기 및 상태 초기화
    const handleClose = useCallback(() => {
        onClose();
        setId("");
        setEmail("");
        setMessage("");
        setIsSuccess(false);
    }, [onClose]);

    // ✅ ESC 키 입력 시 닫기 기능 추가
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") handleClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
        }
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-center">비밀번호 초기화</h3>

                {message && (
                    <div
                        className={`mb-3 text-sm text-center ${isSuccess ? "text-green-600" : "text-red-500"
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm text-gray-600">아이디</label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full border rounded-md p-2 mt-1 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-md p-2 mt-1 text-sm"
                            required
                            autoComplete="email" // ✅ 추가
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-3 py-1.5 rounded-md border text-gray-600 hover:bg-gray-50"
                        >
                            닫기
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            요청
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =====================================================
// 🧭 로그인 메인 페이지
// =====================================================
const LoginPage = () => {
    const { login } = useAuth();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ 로그인 요청 핸들러
    const handleLoginSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError("");
            try {
                await login(userId, password);
            } catch (err) {
                console.error("로그인 실패:", err);

                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";

                setError(errorMessage);
            }
        },
        [userId, password, login]
    );

    return (
        <>
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center items-center gap-2">
                        <Lock size={28} className="text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">OrderFlow 로그인</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">ERP 통합 관리 시스템</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-2 rounded-md mb-4 border border-red-200">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <User size={14} /> 아이디
                        </label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                            className="w-full border rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="아이디를 입력하세요"
                            autoComplete="username" // ✅ 자동완성 힌트
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail size={14} /> 비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password" // ✅ 자동완성 힌트
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 font-semibold transition-colors"
                    >
                        로그인
                    </button>
                </form>

                <div className="text-right mt-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        비밀번호 초기화
                    </button>
                </div>
            </div>

            {/* ✅ 공통 ApiClient 기반 비밀번호 초기화 모달 */}
            <PasswordResetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default LoginPage;
