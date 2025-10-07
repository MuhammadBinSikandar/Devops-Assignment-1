import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Brain, Zap } from 'lucide-react';

function Footer() {
    const footerSections = [
        {
            title: "Product",
            links: ["Features", "Pricing",]
        },
        {
            title: "Company",
            links: ["About Us", "Careers", "Blog",]
        },
        {
            title: "Support",
            links: ["Help Center", "Contact", "Status", "Community"]
        },
    ];

    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-5 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">AI LMS</h3>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Empowering minds through intelligent learning. Join the future of education with our AI-powered learning management system.
                        </p>
                    </div>

                    {footerSections.map((section, index) => (
                        <div key={index}>
                            <h4 className="text-lg font-semibold mb-4 text-white">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-6 mb-4 md:mb-0">
                            <p className="text-gray-400">© 2025 AI LMS. All rights reserved.</p>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-400">All systems operational</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <Zap className="w-3 h-3 mr-1" />
                                AI Powered
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;