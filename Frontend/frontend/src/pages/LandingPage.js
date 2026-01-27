import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    {/* Logo/Brand */}
                    <div className="mb-8 float-animation">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full shadow-2xl">
                            <span className="text-4xl">✨</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text">
                        AI Beauty Consultant
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
                        Your personal AI-powered beauty advisor. Get instant skin analysis,
                        personalized recommendations, and expert styling tips.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/signup"
                            className="btn-premium text-lg px-8 py-4 animate-pulse-glow">
                            Get Started Free 🚀
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white/80 backdrop-blur-sm text-purple-600 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                            Sign In
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            97% Accuracy
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Instant Results
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            100% Private
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text">
                        Powered by Advanced AI
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8 rounded-3xl card-hover">
                            <div className="text-5xl mb-4">🔬</div>
                            <h3 className="text-2xl font-bold mb-3">Skin Analysis</h3>
                            <p className="text-gray-600">
                                DenseNet-201 powered analysis with 97% accuracy. Detects acne,
                                oiliness, texture, and provides personalized skincare routines.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8 rounded-3xl card-hover">
                            <div className="text-5xl mb-4">💇‍♀️</div>
                            <h3 className="text-2xl font-bold mb-3">Hairstyle Matching</h3>
                            <p className="text-gray-600">
                                AI-powered recommendations based on your face shape. Get personalized
                                styling tips and trending looks.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8 rounded-3xl card-hover">
                            <div className="text-5xl mb-4">💄</div>
                            <h3 className="text-2xl font-bold mb-3">Color Matching</h3>
                            <p className="text-gray-600">
                                CIEDE2000 professional color science. Find your perfect foundation
                                shade and makeup colors with 92% accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto glass-card p-12 rounded-3xl text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Transform Your Beauty Routine?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of users getting personalized beauty advice powered by AI
                    </p>
                    <Link to="/signup" className="btn-premium text-lg px-10 py-4">
                        Start Your Free Analysis
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
