import MaterialCardItem from './MaterialCardItem'
import { BookOpen, Sparkles } from 'lucide-react'
import { useStudyMaterials } from '@/lib/hooks/useApiCall';

function StudyMaterialSection({ courseId, course }) {
    const { studyTypeContent, loading: isLoading, error, refetch } = useStudyMaterials(courseId);
    console.log(studyTypeContent);
    const MaterialList = [
        {
            name: 'Notes/Chapters',
            desc: 'Read Notes to get a profound understanding',
            icon: '/notes.png',
            path: '/notes',
            type: 'notes',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            borderColor: 'border-blue-200'
        },
        {
            name: 'Flashcard',
            desc: 'Flashcard help to get a gist of the notes',
            icon: '/flashcard.png',
            path: '/flashcards',
            type: 'flashcard',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200'
        },
        {
            name: 'Quiz',
            desc: 'Great way to test your knowledge',
            icon: '/quiz.png',
            path: '/quiz',
            type: 'quiz',
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100',
            borderColor: 'border-green-200'
        },
        {
            name: 'Question/Answer',
            desc: 'Allows to comprehend your understanding',
            icon: '/qa.png',
            path: '/qa',
            type: 'qa',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-100',
            borderColor: 'border-orange-200'
        },
    ]

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                    <p className="text-gray-600">Choose your preferred learning method</p>
                </div>
                <div className="ml-auto">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">AI-Powered</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MaterialList.map((item, index) => (
                    <MaterialCardItem
                        key={item.name}
                        item={item}
                        studyTypeContent={studyTypeContent}
                        isLoading={isLoading}
                        course={course}
                        refreshData={refetch}
                    />
                ))}
            </div>
        </div>
    )
}

export default StudyMaterialSection
