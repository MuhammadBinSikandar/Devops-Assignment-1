import OpenAI from 'openai';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

// Model configuration for course outline generation
const courseOutlineConfig = {
  model: "gpt-4o", // Latest and most capable GPT model
  temperature: 0.7, // Slightly creative but structured output
  max_tokens: 16384, // Maximum tokens for detailed responses
  top_p: 0.9, // Nucleus sampling for high-quality responses
  frequency_penalty: 0.1, // Slight penalty to reduce repetition
  presence_penalty: 0.1, // Slight penalty to encourage diverse content
  response_format: { type: "json_object" }, // Ensure JSON response
};

// Model configuration for notes generation (more detailed responses)
const notesConfig = {
  model: "gpt-4o", // Latest and most capable GPT model
  temperature: 0.6, // Slightly lower for more focused educational content
  max_tokens: 16384, // Maximum tokens for detailed content
  top_p: 0.85, // Slightly more focused sampling
  frequency_penalty: 0.15, // Higher penalty to reduce repetition in educational content
  presence_penalty: 0.2, // Encourage diverse educational topics
  // No JSON format for notes as they return HTML
};

const courseOutlineMessages = [
  {
    role: "user",
    content: `Generate a comprehensive and detailed study material for Advanced Data Structures designed for Coding Prep at a Hard difficulty level. The study material should be extensive, covering all essential aspects of the topic to ensure thorough learning. Include the following in JSON format: 1. Course Title (as course_title make sure to use a good name) 2. Difficulty Level (difficulty) 3. **Course Summary**: A detailed overview of the course (50-100 words with key as CourseSummary), including its objectives, target audience, and key learning outcomes. 4. **List of Chapters**: A minimum of 8 chapters, each with:- **Chapter Title**: A clear and descriptive title.- **Chapter Summary**: A detailed summary of the chapter's content (at least 100 words per chapter).- **Topic List (as topics)**: A list of at least 5 specific topics(with each topic as topic) covered in the chapter, each with a brief description (2-3 sentences per topic). 5. **Additional Resources**: Suggest at least 3 resources (e.g., books, websites, or videos) relevant to the course, with a brief description of each`,
  },
  {
    role: "assistant",
    content: `{
  "course_title": "Mastering Advanced Data Structures for Coding Interviews",
  "difficulty": "Hard",
  "CourseSummary": "This course is designed to equip aspiring software engineers with a deep understanding of advanced data structures crucial for tackling complex coding challenges and acing technical interviews.  It goes beyond the basics, delving into intricate implementations, performance analysis, and practical applications of these structures. The target audience includes experienced programmers aiming to enhance their problem-solving skills and candidates preparing for challenging interviews at top tech companies.  Upon completion, students will be proficient in designing, implementing, and analyzing advanced data structures, showcasing their expertise in handling large datasets and optimizing algorithm performance.",
  "chapters": [
    {
      "ChapterTitle": "Advanced Tree Structures",
      "ChapterSummary": "This chapter delves into the intricacies of advanced tree structures beyond binary trees.  We'll explore self-balancing trees (AVL, Red-Black), B-trees and their variations (B+ trees, B* trees) crucial for database indexing and efficient data retrieval.  We will cover the underlying principles, algorithms for insertion, deletion, search, and rotation, as well as the time and space complexity analysis of each structure, focusing on their practical applications and comparing their performance characteristics in various scenarios. The advanced techniques used for maintaining balanced trees under insertions and deletions will be a key component. We will also explore applications in specific domains like databases and operating systems.",
      "topics": [
        {
          "topic": "AVL Trees",
          "description": "Detailed explanation of AVL trees, including their self-balancing property, rotations (single and double), and implementation details.  We'll analyze the time complexity of operations and compare it to other self-balancing trees."
        },
        {
          "topic": "Red-Black Trees",
          "description": "In-depth study of Red-Black trees, including their properties, insertion and deletion algorithms, and the complexities of maintaining balance. We will cover the nuances of color flips and rotations."
        },
        {
          "topic": "B-Trees and Variants",
          "description": "Exploration of B-trees, B+ trees, and B* trees, their applications in database indexing, and a comparison of their performance characteristics in various contexts."
        },
        {
          "topic": "Trie Data Structure",
          "description": "Understanding Trie structure, its application in autocomplete, and efficient prefix search operations, focusing on memory optimization techniques."
        },
        {
          "topic": "Segment Trees and Fenwick Trees",
          "description": "Introduction to segment trees and Fenwick trees, focusing on their applications in range queries, and efficient update operations, including advanced use cases like lazy propagation."
        }
      ]
    },
    {
      "ChapterTitle": "Graph Algorithms and Data Structures",
      "ChapterSummary": "This chapter explores advanced graph algorithms and data structures beyond basic traversal. We'll delve into Dijkstra's algorithm for shortest paths, Bellman-Ford algorithm handling negative weights, Minimum Spanning Tree algorithms (Prim's, Kruskal's), topological sorting, strongly connected components, and network flow problems.  Implementation details using adjacency matrices and adjacency lists, focusing on time and space complexity analysis will be covered extensively.  The chapter will also discuss applications in routing protocols, social networks, and transportation systems. Advanced graph traversal techniques like articulation points and bridges will also be included.",
      "topics": [
        {
          "topic": "Dijkstra's Algorithm",
          "description": "Detailed explanation of Dijkstra's algorithm, including implementation using priority queues, handling negative edge weights, and its time and space complexity."
        },
        {
          "topic": "Bellman-Ford Algorithm",
          "description": "Comprehensive coverage of the Bellman-Ford algorithm, its ability to detect negative cycles, and comparison with Dijkstra's algorithm."
        },
        {
          "topic": "Minimum Spanning Trees",
          "description": "In-depth study of Prim's and Kruskal's algorithms for finding Minimum Spanning Trees, including implementation details and complexity analysis."
        },
        {
          "topic": "Network Flow Algorithms",
          "description": "Introduction to network flow problems (Max-flow, Min-cut), Ford-Fulkerson algorithm and its variations (Edmonds-Karp)."
        },
        {
          "topic": "Topological Sorting and Strongly Connected Components",
          "description": "Understanding topological sorting and Kosaraju's algorithm for finding strongly connected components in directed graphs."
        }
      ]
    },
    {
      "ChapterTitle": "Hashing and Hash Tables",
      "ChapterSummary": "This chapter dives deep into hashing techniques, collision resolution strategies, and the performance characteristics of hash tables. We explore different hash functions, including universal hashing and perfect hashing, and discuss various collision handling methods like separate chaining, open addressing (linear probing, quadratic probing, double hashing).  We'll analyze the average and worst-case time complexity of operations, and discuss the impact of load factor on performance.  The chapter will cover advanced topics like consistent hashing and Bloom filters, emphasizing practical applications and optimizations.",
      "topics": [
        {
          "topic": "Hash Functions and Collision Resolution",
          "description": "Overview of various hash functions, including their properties and effectiveness.  Deep dive into collision handling techniques like separate chaining and open addressing."
        },
        {
          "topic": "Universal Hashing",
          "description": "Understanding the concept of universal hashing and its importance in minimizing collisions in worst-case scenarios."
        },
        {
          "topic": "Perfect Hashing",
          "description": "Exploring the concept of perfect hashing and its applications for ensuring no collisions."
        },
        {
          "topic": "Bloom Filters",
          "description": "Introduction to Bloom filters, their probabilistic nature, and applications in improving efficiency of data lookups."
        },
        {
          "topic": "Consistent Hashing",
          "description": "Understanding consistent hashing and its applications in distributed systems for load balancing."
        }
      ]
    },
    {
      "ChapterTitle": "Advanced Sorting Algorithms",
      "ChapterSummary": "This chapter covers advanced sorting algorithms that go beyond the common O(n log n) algorithms.  We'll examine external sorting algorithms (merge sort, distribution sort), which are designed to handle datasets that are too large to fit into memory.  We'll also explore specialized sorting algorithms like radix sort and counting sort, which achieve linear time complexity under specific conditions. The chapter will include a thorough analysis of the time and space complexity of each algorithm and practical considerations for choosing the best algorithm for a given problem.",
      "topics": [
        {
          "topic": "External Sorting",
          "description": "Detailed discussion of external sorting algorithms like merge sort and distribution sort, optimized for handling massive datasets."
        },
        {
          "topic": "Radix Sort",
          "description": "In-depth explanation of radix sort, its linear time complexity under certain conditions, and its implementation details."
        },
        {
          "topic": "Counting Sort",
          "description": "Understanding counting sort, its limitations, and its applications when dealing with integers within a specific range."
        },
        {
          "topic": "Comparison-Based Sorting Lower Bound",
          "description": "Proof of the Ω(n log n) lower bound for comparison-based sorting algorithms."
        },
        {
          "topic": "Adaptive Sorting Algorithms",
          "description": "Brief introduction to adaptive sorting algorithms that perform better on partially sorted data."
        }
      ]
    },
    {
      "ChapterTitle": "Heaps and Priority Queues",
      "ChapterSummary": "This chapter builds upon the fundamental understanding of heaps, focusing on advanced applications and implementations.  We will explore different types of heaps (min-heap, max-heap, Fibonacci heaps), their properties, and algorithms for insertion, deletion, and heapify operations.  The chapter will cover advanced topics such as merging heaps and implementing priority queues using heaps, focusing on their time and space complexity analysis. We'll also look at applications in scheduling algorithms and graph algorithms like Dijkstra's algorithm.",
      "topics": [
        {
          "topic": "Binary Heaps",
          "description": "In-depth study of binary heaps, including their properties, implementation details, and time complexity of operations."
        },
        {
          "topic": "Fibonacci Heaps",
          "description": "Introduction to Fibonacci heaps, their amortized time complexity, and their applications in advanced graph algorithms."
        },
        {
          "topic": "Binomial Heaps",
          "description": "Exploration of Binomial Heaps and their efficient merge operations."
        },
        {
          "topic": "Pairing Heaps",
          "description": "Overview of pairing heaps and their practical advantages in certain scenarios."
        },
        {
          "topic": "Applications of Heaps in Graph Algorithms",
          "description": "Exploring the use of heaps in algorithms like Dijkstra's algorithm and Prim's algorithm."
        }
      ]
    },
    {
      "ChapterTitle": "Advanced Dynamic Programming Techniques",
      "ChapterSummary": "This chapter focuses on advanced dynamic programming techniques, extending beyond basic memoization and tabulation. We'll explore advanced optimization strategies, including bit manipulation for dynamic programming, and techniques for handling overlapping subproblems efficiently.  We'll also discuss solving problems with complex state spaces and optimizing the space complexity of dynamic programming solutions. The chapter includes several challenging problems to solidify the understanding of advanced DP techniques and showcases how to break down complex problems into manageable subproblems.",
      "topics": [
        {
          "topic": "Bit Manipulation in DP",
          "description": "Using bit manipulation to optimize space and time in dynamic programming solutions."
        },
        {
          "topic": "DP with Bitmask",
          "description": "Solving problems using bitmasking techniques to represent subsets and states."
        },
        {
          "topic": "DP Optimization Techniques",
          "description": "Strategies to optimize the time and space complexity of DP solutions, including convex hull optimization and Knuth's optimization."
        },
        {
          "topic": "DP on Trees and Graphs",
          "description": "Applying dynamic programming techniques to tree and graph problems."
        },
        {
          "topic": "Advanced DP Problem Solving",
          "description": "Tackling challenging DP problems that require creative state representation and optimization strategies."
        }
      ]
    },
    {
      "ChapterTitle": "Amortized Analysis of Data Structures",
      "ChapterSummary": "This chapter delves into amortized analysis, a technique used to analyze the average performance of a sequence of operations on a data structure, even if individual operations have varying costs.  We'll explore different methods of amortized analysis, including aggregate analysis, accounting method, and potential method.  The chapter will demonstrate how these methods are used to analyze the performance of data structures like dynamic arrays, splay trees, and amortized self-adjusting data structures. We will cover real-world examples and show the importance of amortized analysis in the practical application of algorithms.",
      "topics": [
        {
          "topic": "Aggregate Analysis",
          "description": "Understanding the aggregate analysis method and its application in analyzing data structures."
        },
        {
          "topic": "Accounting Method",
          "description": "Detailed explanation of the accounting method and its usage in amortized analysis."
        },
        {
          "topic": "Potential Method",
          "description": "Comprehensive coverage of the potential method for amortized analysis."
        },
        {
          "topic": "Amortized Analysis of Dynamic Arrays",
          "description": "Analyzing the amortized time complexity of operations on dynamic arrays."
        },
        {
          "topic": "Amortized Analysis of Splay Trees",
          "description": "Understanding the amortized performance of splay trees."
        }
      ]
    },
    {
      "ChapterTitle": "Advanced String Algorithms",
      "ChapterSummary": "This chapter goes beyond basic string algorithms, covering advanced techniques like suffix arrays, suffix trees, and the Knuth-Morris-Pratt (KMP) algorithm for pattern matching.  We'll explore the construction and applications of suffix arrays and suffix trees, including efficient substring search and longest common subsequence problems.  The chapter will also discuss advanced pattern matching techniques, including algorithms for finding multiple patterns, approximate pattern matching, and regular expression matching.  A comparative analysis of these advanced algorithms' time and space complexity will be included.",
      "topics": [
        {
          "topic": "Suffix Arrays",
          "description": "Constructing suffix arrays and using them for efficient substring search."
        },
        {
          "topic": "Suffix Trees",
          "description": "Building and using suffix trees for efficient pattern matching and other string algorithms."
        },
        {
          "topic": "Knuth-Morris-Pratt (KMP) Algorithm",
          "description": "Detailed explanation of the KMP algorithm and its optimization for pattern matching."
        },
        {
          "topic": "Boyer-Moore Algorithm",
          "description": "Understanding the Boyer-Moore algorithm and its variations for fast string searching."
        },
        {
          "topic": "Rabin-Karp Algorithm",
          "description": "Introduction to Rabin-Karp algorithm and its application in string matching."
        }
      ]
    }
  ],
  "AdditionalResources": [
    {
      "resource": "Introduction to Algorithms, Third Edition by Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein",
      "description": "A comprehensive textbook covering a wide range of algorithms and data structures, including advanced topics."
    },
    {
      "resource": "Algorithms, 4th Edition by Robert Sedgewick and Kevin Wayne",
      "description": "Another excellent textbook with clear explanations and numerous examples, suitable for self-study."
    },
    {
      "resource": "GeeksforGeeks",
      "description": "A popular website with extensive articles, tutorials, and practice problems on various algorithms and data structures."
    }
  ]
}`
  },
];

const notesMessages = [
  {
    role: "user",
    content: `Generate exam material detail content for each chapter.
- Make sure to cover all the topic points in the content.
- Make sure to give content in HTML (Do not add HTML, Head, Body, Title tag), The chapters.
- Provide detailed content for all the topics of the chapter

{
      "ChapterTitle": "Advanced Tree Structures",
      "ChapterSummary": "This chapter explores tree structures beyond basic binary trees.  We delve into advanced tree types such as AVL trees, red-black trees, B-trees, and tries.  The focus will be on the self-balancing properties of AVL and red-black trees, their applications in databases and efficient searching, B-tree implementation for disk-based systems, and the use of tries for efficient string searching and autocompletion.  We'll also analyze the time and space complexity of various operations on these trees, comparing their performance characteristics under different scenarios.  Students will learn to choose the appropriate tree structure based on the specific requirements of a given problem.",
      "TopicList": [
        {
          "topic": "AVL Trees",
          "description": "Understanding the self-balancing property of AVL trees. Implementing rotations for maintaining balance. Analyzing time complexity of operations like insertion, deletion, and search."
        },
        {
          "topic": "Red-Black Trees",
          "description": "Learning the properties of red-black trees.  Implementing insertion and deletion with color adjustments. Comparing AVL and Red-Black tree performance."
        },
        {
          "topic": "B-Trees",
          "description": "Understanding the structure and functionality of B-trees.  Implementing B-tree operations for efficient disk access.  Analyzing the performance benefits of B-trees in databases."
        },
        {
          "topic": "Tries",
          "description": "Implementing tries for efficient string searching and prefix matching.  Analyzing the time complexity of various trie operations.  Exploring applications in autocompletion and spell checkers."
        },
        {
          "topic": "Advanced Tree Traversal Algorithms",
          "description": "Exploring advanced traversal algorithms such as preorder, inorder, postorder, level-order, and depth-first search. Implementing iterative and recursive versions of these algorithms. Analyzing the time and space complexity of these algorithms."
        }
      ]
    },`
  },
  {
    role: "assistant",
    content: `<h3>Chapter: Advanced Tree Structures</h3>
<p>This chapter explores tree structures beyond basic binary trees, focusing on AVL trees, red-black trees, B-trees, and tries.  We will analyze their self-balancing properties, applications, and performance characteristics, enabling you to choose the appropriate structure for various problems.</p>

<h4>1. AVL Trees</h4>
<p>AVL trees are self-balancing binary search trees.  The balance factor of each node (the height difference between its left and right subtrees) must be -1, 0, or 1.  To maintain this balance, rotations are performed upon insertion or deletion. </p>
<ul>
  <li><strong>Self-Balancing Property:</strong>  Understand how the balance factor ensures logarithmic time complexity for operations.</li>
  <li><strong>Rotations:</strong>  Master the implementation of single and double rotations (left-left, left-right, right-left, right-right) to rebalance the tree.</li>
  <li><strong>Time Complexity Analysis:</strong> Analyze the time complexity of insertion, deletion, and search operations (all O(log n)).  Illustrate with examples.</li>
  <li><strong>Example Implementations (pseudocode or snippets):</strong>  Show examples of insertion and deletion, highlighting rotation logic.</li>
</ul>


<h4>2. Red-Black Trees</h4>
<p>Red-black trees are another type of self-balancing binary search tree.  They use color (red or black) to maintain balance, ensuring logarithmic time complexity. Unlike AVL trees, they allow for a slightly less strict balance, resulting in fewer rotations during updates, potentially leading to faster performance in some scenarios.</p>
<ul>
  <li><strong>Properties of Red-Black Trees:</strong>  Understand the five properties that define a valid red-black tree (root, external nodes, red node properties, black height).</li>
  <li><strong>Insertion and Deletion:</strong> Implement insertion and deletion algorithms, including color adjustments and rotations as needed. Emphasize the handling of different cases and the maintenance of red-black properties.</li>
  <li><strong>Comparison with AVL Trees:</strong>  Compare and contrast the performance characteristics of AVL and red-black trees. Discuss scenarios where one might be preferred over the other.</li>
  <li><strong>Example Implementations (pseudocode or snippets):</strong> Provide examples demonstrating insertion and deletion with color changes and rotations.</li>
</ul>


<h4>3. B-Trees</h4>
<p>B-trees are designed for disk-based systems, where disk access is significantly slower than memory access. They minimize disk I/O operations by storing multiple keys and children in each node.</p>
<ul>
  <li><strong>Structure and Functionality:</strong> Explain the structure of a B-tree node (keys, children), the minimum and maximum degree, and how keys are ordered within nodes.</li>
  <li><strong>B-Tree Operations:</strong>  Implement insertion and deletion operations, focusing on splitting and merging nodes to maintain the B-tree properties. Emphasize the impact on disk I/O efficiency.</li>
  <li><strong>Performance Benefits in Databases:</strong> Discuss how B-trees are crucial for efficient data retrieval in database systems by minimizing the number of disk accesses.</li>
  <li><strong>Example Implementations (pseudocode or snippets):</strong>  Provide examples demonstrating insertion and deletion, highlighting node splitting and merging.</li>
</ul>


<h4>4. Tries</h4>
<p>Tries (prefix trees) are tree-like data structures used for efficient string searching and prefix matching.  Each node represents a character, and paths from the root to a leaf represent strings.</p>
<ul>
  <li><strong>Implementation:</strong>  Explain the implementation of a trie, including the structure of nodes (character, children, isEndOfWord flag).</li>
  <li><strong>String Searching and Prefix Matching:</strong> Demonstrate how to efficiently search for strings and find all strings with a given prefix using a trie.</li>
  <li><strong>Time Complexity Analysis:</strong> Analyze the time complexity of various trie operations (insertion, search, prefix matching).  Highlight the advantages compared to other string searching techniques.</li>
  <li><strong>Applications:</strong> Discuss applications of tries in autocompletion, spell checkers, and other string-related tasks.</li>
  <li><strong>Example Implementations (pseudocode or snippets):</strong>  Show examples of insertion, search, and prefix matching operations.</li>
</ul>


<h4>5. Advanced Tree Traversal Algorithms</h4>
<p>This section expands on standard tree traversal techniques. We explore their iterative and recursive implementations and analyze their time and space complexities.</p>
<ul>
  <li><strong>Preorder, Inorder, Postorder Traversal:</strong> Review these classic traversal algorithms and provide iterative and recursive implementations.</li>
  <li><strong>Level-Order Traversal (Breadth-First Search):</strong> Implement level-order traversal using a queue.</li>
  <li><strong>Depth-First Search (DFS):</strong>  Explain how preorder, inorder, and postorder traversals are all forms of DFS and their applications.</li>
  <li><strong>Time and Space Complexity Analysis:</strong> Compare the time and space complexity of each algorithm.</li>
  <li><strong>Example Implementations (pseudocode or snippets):</strong>  Provide code examples for each traversal algorithm in at least one of the iterative or recursive styles.</li>
</ul>`
  },
];

// Export a function to generate the course outline
export const generateCourseOutline = async (prompt) => {
  try {
    // Prepare messages array with conversation history and new prompt
    const messages = [
      ...courseOutlineMessages,
      {
        role: "user",
        content: prompt
      }
    ];

    // Call OpenAI API with comprehensive configuration
    const completion = await openai.chat.completions.create({
      ...courseOutlineConfig,
      messages: messages,
      stream: false, // Set to true if you want streaming responses
      seed: 42, // For reproducible outputs (optional)
      logit_bias: {}, // Can be used to bias certain tokens (optional)
      user: "course_generator", // User identifier for monitoring (optional)
    });

    return {
      response: {
        text: completion.choices[0].message.content,
        candidates: [{
          content: {
            parts: [{
              text: completion.choices[0].message.content
            }]
          }
        }]
      },
      usage: completion.usage,
      model: completion.model,
      finish_reason: completion.choices[0].finish_reason
    };
  } catch (error) {
    console.error('Error generating course outline:', error);

    // Enhanced error handling
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please verify your API key.');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    throw error;
  }
};

// Export a function to generate detailed notes
export const generateNotes = async (prompt) => {
  try {
    // Prepare messages array with conversation history and new prompt
    const messages = [
      ...notesMessages,
      {
        role: "user",
        content: prompt
      }
    ];

    // Call OpenAI API with comprehensive configuration for notes
    const completion = await openai.chat.completions.create({
      ...notesConfig,
      messages: messages,
      stream: false, // Set to true if you want streaming responses
      seed: 123, // Different seed for notes generation
      logit_bias: {}, // Can be used to bias certain tokens
      user: "notes_generator", // User identifier for monitoring
      stop: null, // Custom stop sequences (optional)
      logprobs: false, // Set to true if you want log probabilities
      top_logprobs: null, // Number of top log probabilities to return
    });

    return {
      response: {
        text: completion.choices[0].message.content,
        candidates: [{
          content: {
            parts: [{
              text: completion.choices[0].message.content
            }]
          }
        }]
      },
      usage: completion.usage,
      model: completion.model,
      finish_reason: completion.choices[0].finish_reason
    };
  } catch (error) {
    console.error('Error generating notes:', error);

    // Enhanced error handling
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please verify your API key.');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.code === 'model_not_found') {
      throw new Error('Model not found. Please check if you have access to GPT-4o.');
    }

    throw error;
  }
};

// Additional utility function for custom prompts with full control
export const generateCustomContent = async (prompt, options = {}) => {
  try {
    const customConfig = {
      model: options.model || "gpt-4o",
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens || 16384,
      top_p: options.top_p ?? 0.9,
      frequency_penalty: options.frequency_penalty ?? 0.1,
      presence_penalty: options.presence_penalty ?? 0.1,
      response_format: options.response_format || undefined,
      seed: options.seed || undefined,
      stop: options.stop || null,
      stream: options.stream || false,
      logit_bias: options.logit_bias || {},
      logprobs: options.logprobs || false,
      top_logprobs: options.top_logprobs || null,
      user: options.user || "custom_generator",
      tools: options.tools || undefined,
      tool_choice: options.tool_choice || undefined,
    };

    const messages = [
      {
        role: "system",
        content: options.system_prompt || "You are a helpful AI assistant specialized in educational content creation."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const completion = await openai.chat.completions.create({
      ...customConfig,
      messages: messages,
    });

    return {
      response: {
        text: completion.choices[0].message.content,
        candidates: [{
          content: {
            parts: [{
              text: completion.choices[0].message.content
            }]
          }
        }]
      },
      usage: completion.usage,
      model: completion.model,
      finish_reason: completion.choices[0].finish_reason
    };
  } catch (error) {
    console.error('Error generating custom content:', error);
    throw error;
  }
};

// Utility function to estimate token count (approximate)
export const estimateTokenCount = (text) => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

// Function to validate API key format
export const validateApiKey = (apiKey) => {
  const openaiKeyPattern = /^sk-proj-[A-Za-z0-9]{48,}$/;
  return openaiKeyPattern.test(apiKey);
};
