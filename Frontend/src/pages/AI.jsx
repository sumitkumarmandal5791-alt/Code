import { useForm } from "react-hook-form"
import axiosClient from "../utils/axios"
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useState, useEffect } from "react";
function AI() {
    const params = useParams();
    const problemId = params.id;
    const [messages, setMessages] = useState([]);
    const { register, handleSubmit, reset } = useForm();


    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axiosClient.get(`/ai/message/${problemId}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        };
        fetchHistory();
    }, [problemId]);

    const onSubmit = async (data) => {
        // Optimistically add user message
        const userMsg = { role: 'user', parts: [{ text: data.message }] };
        setMessages(prev => [...prev, userMsg]);
        reset(); // Clear input

        try {
            const response = await axiosClient.post(`/ai/message/${problemId}`, {
                msg: data.message
            });

            // Add model response
            const modelMsg = { role: 'model', parts: [{ text: response.data }] };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col h-[600px] w-full p-4 border rounded-lg shadow-lg bg-base-100">
            <h1 className="text-2xl font-bold mb-4 text-center">AI Assistant</h1>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                        <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Ask something..."
                    className="input input-bordered flex-1"
                    {...register("message", { required: true })}
                />
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
        </div>
    )
}

export default AI