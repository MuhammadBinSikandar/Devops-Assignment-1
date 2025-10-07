// Static data for profile forms - separated for better performance
export const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
    'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
    'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
    'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export const grades = [
    'Elementary (K-5)', '6th Grade', '7th Grade', '8th Grade', '9th Grade (Freshman)',
    '10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)',
    'College Freshman', 'College Sophomore', 'College Junior', 'College Senior',
    'Graduate Student', 'Adult Learner', 'Other'
];

export const learningStyles = [
    { value: 'visual', label: 'Visual (Learn by seeing)' },
    { value: 'auditory', label: 'Auditory (Learn by hearing)' },
    { value: 'kinesthetic', label: 'Kinesthetic (Learn by doing)' },
    { value: 'reading', label: 'Reading/Writing (Learn by reading and writing)' }
];

export const educationLevels = [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree',
    'Doctoral Degree', 'Professional Degree', 'Trade/Vocational Training', 'Other'
];

export const parentingExperience = [
    { value: 'first-time', label: 'First-time Parent' },
    { value: 'experienced', label: 'Experienced Parent (2-5 years)' },
    { value: 'very-experienced', label: 'Very Experienced Parent (5+ years)' }
];

export const childrenAgeRanges = [
    '0-5 years', '6-10 years', '11-15 years', '16-18 years', 'Mixed ages'
];

// Grouped subjects for better performance and organization
export const subjectCategories = {
    'Mathematics': [
        'Mathematics', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'
    ],
    'Sciences': [
        'Physics', 'Chemistry', 'Biology', 'Earth Science', 'Environmental Science', 'Astronomy'
    ],
    'Language Arts': [
        'English Literature', 'Creative Writing', 'Grammar', 'Poetry', 'Public Speaking', 'Journalism'
    ],
    'Social Studies': [
        'World History', 'American History', 'European History', 'Ancient History', 'Political Science', 'Government'
    ],
    'Social Sciences': [
        'Geography', 'Cultural Studies', 'Anthropology', 'Sociology', 'Psychology', 'Philosophy'
    ],
    'Technology': [
        'Computer Science', 'Programming', 'Web Development', 'Data Science', 'Artificial Intelligence', 'Cybersecurity'
    ],
    'Arts': [
        'Art', 'Drawing', 'Painting', 'Sculpture', 'Photography', 'Graphic Design', 'Digital Art'
    ],
    'Music': [
        'Music', 'Piano', 'Guitar', 'Violin', 'Singing', 'Music Theory', 'Music Composition'
    ],
    'Health & Fitness': [
        'Physical Education', 'Sports', 'Fitness', 'Health', 'Nutrition', 'Yoga', 'Dance'
    ],
    'Languages': [
        'Spanish', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Arabic', 'Portuguese'
    ],
    'Business': [
        'Economics', 'Business', 'Entrepreneurship', 'Accounting', 'Marketing', 'Finance'
    ],
    'Engineering': [
        'Engineering', 'Robotics', 'Electronics', 'Mechanical Engineering', 'Civil Engineering'
    ],
    'Medical': [
        'Medicine', 'Nursing', 'Pharmacy', 'Veterinary Science', 'Dentistry'
    ],
    'Media & Arts': [
        'Drama', 'Theater', 'Film Studies', 'Communications', 'Media Studies'
    ],
    'Life Skills': [
        'Cooking', 'Gardening', 'Woodworking', 'Fashion Design', 'Interior Design'
    ]
};

// Flattened list for backward compatibility
export const subjectOptions = Object.values(subjectCategories).flat().concat(['Other']);

