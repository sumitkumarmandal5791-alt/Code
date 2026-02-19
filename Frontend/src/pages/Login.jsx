import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { loginUser } from '../authSlice'


const LoginSchema = z.object({
    emailId: z.string().email("Invalid email"),
    password: z.string().min(6, "password should contain 6 character")
})

function Login() {

    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(LoginSchema)
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthentication } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthentication) {
            navigate("/");
        }
    }, [isAuthentication, navigate])


    function submitData(data) {
        dispatch(loginUser(data))
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Heading */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-white tracking-tight">
                        LeetCode
                    </h1>
                    <p className="mt-3 text-gray-400 text-lg">
                        Sign in to LeetCode
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-gray-800/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/40 p-8">
                    <form
                        onSubmit={handleSubmit(submitData)}
                        className="flex flex-col space-y-6"
                    >
                        {/* Email */}
                        <div>
                            <label htmlFor="emailId" className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="emailId"
                                {...register('emailId')}
                                placeholder="Enter Your email"
                                className={`w-full px-4 py-3 bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                            {errors.emailId && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.emailId.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register('password')}
                                placeholder="Enter password"
                                className={`w-full px-4 py-3 bg-gray-900 border ${errors.password ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                                     text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                     focus:ring-offset-gray-900 transition-all duration-200"
                        >
                            Sign in
                        </button>
                        <p className="mt-4 text-center text-sm text-gray-400">
                            New to Leetcode?{" "}
                            <Link
                                to="/signup"
                                className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>

    )
}
export default Login