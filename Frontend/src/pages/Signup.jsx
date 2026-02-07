import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../authSlice'
import { useNavigate } from 'react-router';
import { useEffect } from 'react';


const signupSchema = z.object({
    firstName: z.string().min(3, "Name should contain atleast 3 char"),
    emailId: z.string().email("Invalid email"),
    password: z.string().min(8, "password should contain 8 character")
})


function Signup() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthentication, loading } = useSelector((state) => state.auth)
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(signupSchema)
    });



    const submitData = (data) => {
        dispatch(registerUser(data))
    }

    useEffect(() => {
        if (isAuthentication) {
            navigate('/');
        }
    }, [isAuthentication, navigate])


    if (loading) {
        return <div className='min-h-screen flex items-center justify-center'>
            <span className='loading loading-spinner'></span>
        </div>
    }
    //signup karne ke baad home page ki taraf navigate kar do

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Heading */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-white tracking-tight">
                        LeetCode
                    </h1>
                    <p className="mt-3 text-gray-400 text-lg">
                        Create your account and start solving
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-gray-800/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/40 p-8">
                    <form
                        onSubmit={handleSubmit(submitData)}
                        className="flex flex-col space-y-6"
                    >
                        {/* Name */}
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input
                                id="firstName"
                                {...register('firstName')}
                                placeholder="Enter Your Name"
                                className={`w-full px-4 py-3 bg-gray-900 border ${errors.firstName ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="emailId" className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="emailId"
                                {...register('emailId')}
                                placeholder="Enter Your email"
                                className={`w-full px-4 py-3 bg-gray-900 border ${errors.emailId ? 'border-red-500' : 'border-gray-600'
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
                            // className='w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
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
                            disabled={loading}
                        >
                            Sign up
                        </button>

                        {/* Sign in link */}
                        <p className="text-center text-gray-400 text-sm mt-4">
                            Already have an account?{' '}
                            <a href="./login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign in
                            </a>
                        </p>
                    </form>

                </div>
            </div>
        </div>
    )
}



























































// import { useForm } from 'react-hook-form';
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"


// const signupSchema = z.object({
//     firstName: z.string().min(3, "Name should contain atleast 3 char"),
//     email: z.string().email("Invalid email"),
//     password: z.string().min(8, "password should contain 8 character")
// })

// function Signup() {
//     const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(signupSchema) });

//     function submitData(data) {
//         console.log(data);
//     }
//     return (
//         <>
//             <form onSubmit={handleSubmit(submitData)} className="flex flex-col justify-center items-center">
//                 <input {...register('firstName', { required: true })}
//                     placeholder='Enter Your Name' />
//                 {errors.firstName && (<span>{errors.firstName.message}</span>)}
//                 <input {...register('email', { required: true })}
//                     placeholder='Enter Your email' />
//                 {errors.email && (<span>{errors.email.message}</span>)}
//                 <input {...register('password', { required: true })}
//                     placeholder='Enter password' />
//                 {errors.password && (<span>{errors.password.message}</span>)}
//                 <button type="submit" className='btn btn-primary'>Submit</button>

//             </form>
//         </>
//     )







// import { useEffect, useState } from "react"
// function Signup() {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [Password, setPassword] = useState('');



//     function handleSubmit(e) {
//         e.preventDefault();//prevents the default behavior of the form
//         console.log(name, email, Password);
//     }
//     return (
//         <>
//             <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center">
//                 <input type="text" placeholder="Enter your name" value={name} onChange={(e) => { setName(e.target.value) }}></input>
//                 <input type="text" placeholder="Enter your Email" value={email} onChange={(e) => { setEmail(e.target.value) }}></input>
//                 <input type="password" placeholder="Enter your Password" value={Password} onChange={(e) => { setPassword(e.target.value) }}></input>
//                 <button type="submit">Submit</button>
//             </form>
//         </>
//     )
// }
export default Signup