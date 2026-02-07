import React from "react";
import { PlusCircle, Edit, Trash2, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Adminpage() {
    const cards = [
        {
            title: "Create Problem",
            desc: "Add a new coding problem with details, difficulty, and tags.",
            icon: <PlusCircle className="w-10 h-10 text-primary" />,
            btn: "Create",
            btnStyle: "btn-primary"
        },
        {
            title: "Update Problem",
            desc: "Edit existing problems, update statements or constraints.",
            icon: <Edit className="w-10 h-10 text-warning" />,
            btn: "Update",
            btnStyle: "btn-warning"
        },
        {
            title: "Delete Problem",
            desc: "Remove problems permanently from the platform.",
            icon: <Trash2 className="w-10 h-10 text-error" />,
            btn: "Delete",
            btnStyle: "btn-error"
        },
        {
            title: "Upload and Delete Video",
            desc: "Upload and Delete Video.",
            icon: <Video className="w-10 h-10 text-error" />,
            btn: "Upload/Delete",
            btnStyle: "btn-primary"
        }
    ];

    const navigate = useNavigate();

    const [page, setPage] = useState("");
    useEffect(() => {
        if (page === "Create Problem") {
            navigate("/admin/create")
        }
        if (page === "Update Problem") {
            navigate("/admin/update")
        }
        if (page === "Delete Problem") {
            navigate("/admin/delete")
        }
        if (page === "Upload and Delete Video") {
            navigate("/admin/video")
        }

    }, [page])


    return (
        <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card, idx) => (
                <div key={idx} className="card bg-base-100 shadow-md hover:shadow-xl transition">
                    <div className="card-body items-center text-center">
                        {card.icon}
                        <h2 className="card-title mt-2">{card.title}</h2>
                        <p className="text-sm opacity-80">{card.desc}</p>
                        <div className="card-actions mt-4">
                            <button className={`btn ${card.btnStyle} btn-sm`} onClick={() => setPage(card.title)}>{card.btn}</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
