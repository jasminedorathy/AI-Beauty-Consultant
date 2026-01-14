import React from 'react';

const HairStyling = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center animate-fade-in-up">
            <div className="max-w-4xl w-full">
                <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Hair Styling Studio 💇</h1>
                <p className="text-gray-500 text-lg mb-8">AI-recommended hairstyles based on your face shape.</p>

                <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                    <div className="text-6xl mb-4">✂️</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
                    <p className="text-gray-500">We are fine-tuning our hairstyle database to match your unique face geometry.</p>
                </div>
            </div>
        </div>
    );
};

export default HairStyling;
