-- Add Real-World Solution Framework data to the first GitHub project for testing

UPDATE github_projects
SET 
  "caseStudy" = 'A Fortune 500 financial institution needed to implement machine learning models for fraud detection. Their existing system was outdated and couldn''t handle the scale of transactions they were processing daily. The ML team needed a flexible, scalable framework that could handle both training complex models and deploying them in production environments with low latency.',
  
  "problemStatement" = 'Building and deploying machine learning models at scale presents several challenges: training models requires significant computational resources, managing different model versions is complex, ensuring models perform consistently across environments is difficult, and integrating ML workflows with existing infrastructure requires significant engineering effort.',
  
  "solutionDescription" = 'This project provides an end-to-end machine learning platform that simplifies building, training, and deploying ML models. It offers high-level APIs for common ML tasks, supports distributed training across multiple GPUs/TPUs, includes built-in model versioning and experiment tracking, and provides production-ready serving infrastructure. The framework abstracts away complexity while remaining flexible enough for custom implementations.',
  
  "prerequisites" = ARRAY[
    'Strong understanding of Python programming',
    'Solid foundation in linear algebra and calculus',
    'Experience with NumPy and basic data manipulation',
    'Familiarity with machine learning concepts (supervised/unsupervised learning)',
    'Understanding of neural networks and deep learning fundamentals',
    'Basic knowledge of software engineering best practices'
  ],
  
  "deliverables" = ARRAY[
    'Complete source code with proper documentation and comments',
    'Training pipeline implementation with data preprocessing',
    'Model architecture definition and hyperparameter configuration',
    'Evaluation metrics implementation and visualization',
    'Deployment scripts for production environment',
    'Comprehensive README with setup instructions',
    'Unit tests covering core functionality',
    'Performance benchmarks and optimization analysis'
  ],
  
  "supposedDeadline" = '6-8 weeks for implementation, testing, and deployment'
  
WHERE id = (
  SELECT id FROM github_projects 
  WHERE LOWER(title) LIKE '%tensorflow%' 
  LIMIT 1
);

-- Verify the update
SELECT id, title, 
  CASE WHEN "caseStudy" IS NOT NULL THEN '✓' ELSE '✗' END as has_case_study,
  CASE WHEN "problemStatement" IS NOT NULL THEN '✓' ELSE '✗' END as has_problem,
  CASE WHEN "solutionDescription" IS NOT NULL THEN '✓' ELSE '✗' END as has_solution,
  array_length("prerequisites", 1) as prerequisites_count,
  array_length("deliverables", 1) as deliverables_count,
  "supposedDeadline"
FROM github_projects 
WHERE LOWER(title) LIKE '%tensorflow%'
LIMIT 1;
