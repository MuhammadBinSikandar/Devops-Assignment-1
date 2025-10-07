import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'
import { ArrowRight, CheckCircle, Clock, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function MaterialCardItem({ item, studyTypeContent, isLoading, course, refreshData }) {
    // const isContentReady = studyTypeContent?.[item.type]?.length > 0;
    const [loading, setLoading] = React.useState(false);

    const Generate = async () => {
        toast.loading('Generating Content...');
        setLoading(true);

        let chapters = '';
        course?.courseLayout.chapters.forEach((chapter) => {
            chapters = chapter.ChapterTitle + ',' + chapters
        });

        try {
            const response = await fetch('/api/study-type-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId: course?.courseId,
                    chapters: chapters,
                    type: item.type
                }),
            });

            const result = await response.json();
            console.log('Generation started:', result);

        } catch (error) {
            console.error('Error generating content:', error);
        } finally {
            setLoading(false);
            const updated = await refreshData();
            if (updated?.flashcard?.status === 'Ready') {
                toast.success('Flashcards are ready');
            }
        }
    }

    return (

        <div className={`group relative bg-gradient-to-br ${item.bgColor} border-2 ${item.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${(!studyTypeContent?.[item.type] || studyTypeContent[item.type].length === 0) && 'grayscale'}`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br ${item.color} rounded-full transform translate-x-6 -translate-y-6`}></div>
            </div>

            {/* Status badge */}
            <div className="flex justify-between items-start mb-4">
                {!studyTypeContent?.[item.type] || studyTypeContent[item.type].length === 0 ?
                    <Badge className="bg-gray-500 text-white hover:bg-gray-600 text-xs px-2 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Generate
                    </Badge> :
                    <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs px-2 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                    </Badge>
                }
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Image
                        src={item.icon}
                        alt={item.name}
                        height={32}
                        width={32}
                        className="filter brightness-0 invert"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    {item.desc}
                </p>
            </div>

            {/* Action button */}
            {!studyTypeContent?.[item.type] || studyTypeContent[item.type].length === 0 ?
                <Button className={`w-full bg-gradient-to-r ${item.color} hover:shadow-lg transition-all duration-300 text-white group-hover:scale-105`} onClick={() => Generate()}>
                    {loading && <RefreshCcw className="animate-spin" />}
                    Generate
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                :
                <Link href={'/course/' + course?.courseId + item.path}>
                    <Button
                        className={`w-full border-2 bg-white/50 hover:bg-white/80 transition-all duration-300 font-semibold ${item.borderColor} text-gray-700`}
                        variant="outline"
                    >
                        View
                    </Button>
                </Link>
            }
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    )
}

export default MaterialCardItem
