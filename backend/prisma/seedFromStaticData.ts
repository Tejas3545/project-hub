/**
 * Seed GitHub Projects from Static Data
 * Uses curated projects from githubProjectsData.ts
 */

import { PrismaClient } from '@prisma/client';
import { parse } from 'url';

const prisma = new PrismaClient();

// Extract repo details from GitHub URL
function extractRepoInfo(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return { owner: '', name: '', branch: 'main' };
  return {
    owner: match[1],
    name: match[2],
    branch: 'main'
  };
}

async function seedFromStaticData() {
  console.log('🚀 Seeding GitHub Projects from Static Data...\n');

  try {
    // Fetch domains
    const domains = await prisma.domain.findMany();
    const domainMap = new Map<string, string>();
    
    for (const domain of domains) {
      domainMap.set(domain.slug, domain.id);
      domainMap.set(domain.name.toLowerCase(), domain.id);
    }

    console.log(`Found ${domains.length} domains:\n`, domains.map(d => `- ${d.name} (${d.slug})`).join('\n'));

    // Static curated projects
    const projectsData = [
      // Cybersecurity Projects
      {
        domain: 'cybersecurity',
        projects: [
          { title: 'OWASP ZAP - Web App Security Scanner', description: 'The OWASP Zed Attack Proxy (ZAP) is one of the world\'s most popular free security tools.', repoUrl: 'https://github.com/zaproxy/zaproxy', liveUrl: 'https://www.zaproxy.org/', stars: 12500, forks: 2200, language: 'Java', techStack: ['Java', 'Security', 'OWASP'], difficulty: 'HARD', topics: ['security', 'penetration-testing', 'owasp'] },
          { title: 'Metasploit Framework', description: 'The world\'s most used penetration testing framework.', repoUrl: 'https://github.com/rapid7/metasploit-framework', liveUrl: 'https://www.metasploit.com/', stars: 33000, forks: 13500, language: 'Ruby', techStack: ['Ruby', 'Pentesting'], difficulty: 'HARD', topics: ['security', 'penetration-testing'] },
          { title: 'Nmap - Network Scanner', description: 'Free and open source utility for network discovery.', repoUrl: 'https://github.com/nmap/nmap', liveUrl: 'https://nmap.org/', stars: 9800, forks: 2400, language: 'C', techStack: ['C', 'Network'], difficulty: 'MEDIUM', topics: ['network', 'security'] },
          { title: 'Wireshark', description: 'World\'s foremost network protocol analyzer.', repoUrl: 'https://github.com/wireshark/wireshark', liveUrl: 'https://www.wireshark.org/', stars: 6500, forks: 1800, language: 'C', techStack: ['C', 'Qt'], difficulty: 'HARD', topics: ['networking', 'packet-analyzer'] },
          { title: 'John the Ripper', description: 'Password security auditing and recovery tool.', repoUrl: 'https://github.com/openwall/john', liveUrl: 'https://www.openwall.com/john/', stars: 9200, forks: 2100, language: 'C', techStack: ['C', 'Cryptography'], difficulty: 'MEDIUM', topics: ['password', 'security'] },
          { title: 'SQLMap', description: 'Automatic SQL injection tool.', repoUrl: 'https://github.com/sqlmapproject/sqlmap', liveUrl: 'https://sqlmap.org/', stars: 31000, forks: 5700, language: 'Python', techStack: ['Python', 'SQL'], difficulty: 'MEDIUM', topics: ['sql-injection', 'security'] },
          { title: 'Aircrack-ng', description: 'WiFi security auditing tools.', repoUrl: 'https://github.com/aircrack-ng/aircrack-ng', liveUrl: 'https://www.aircrack-ng.org/', stars: 5200, forks: 1200, language: 'C', techStack: ['C', 'WiFi'], difficulty: 'MEDIUM', topics: ['wifi', 'security'] },
          { title: 'Hashcat', description: 'World\'s fastest password cracker.', repoUrl: 'https://github.com/hashcat/hashcat', liveUrl: 'https://hashcat.net/', stars: 20500, forks: 2700, language: 'C', techStack: ['C', 'CUDA'], difficulty: 'HARD', topics: ['password', 'cracking'] },
          { title: 'Snort', description: 'Network intrusion detection system.', repoUrl: 'https://github.com/snort3/snort3', liveUrl: 'https://www.snort.org/', stars: 2800, forks: 680, language: 'C++', techStack: ['C++', 'IDS'], difficulty: 'HARD', topics: ['ids', 'network'] },
          { title: 'Kali Linux Tools', description: 'Collection of penetration testing tools.', repoUrl: 'https://github.com/LionSec/katoolin', liveUrl: null, stars: 3100, forks: 890, language: 'Python', techStack: ['Python', 'Security'], difficulty: 'EASY', topics: ['kali', 'pentesting'] },
        ]
      },
      // Web Development Projects
      {
        domain: 'web-development',
        projects: [
          { title: 'React', description: 'JavaScript library for building user interfaces.', repoUrl: 'https://github.com/facebook/react', liveUrl: 'https://react.dev/', stars: 227000, forks: 46300, language: 'JavaScript', techStack: ['JavaScript', 'UI'], difficulty: 'MEDIUM', topics: ['react', 'ui'] },
          { title: 'Vue.js', description: 'Progressive JavaScript framework.', repoUrl: 'https://github.com/vuejs/vue', liveUrl: 'https://vuejs.org/', stars: 207000, forks: 33700, language: 'JavaScript', techStack: ['JavaScript', 'Framework'], difficulty: 'EASY', topics: ['vue', 'framework'] },
          { title: 'Next.js', description: 'The React Framework for production.', repoUrl: 'https://github.com/vercel/next.js', liveUrl: 'https://nextjs.org/', stars: 125000, forks: 26700, language: 'JavaScript', techStack: ['React', 'SSR'], difficulty: 'MEDIUM', topics: ['nextjs', 'react'] },
          { title: 'Angular', description: 'Platform for building mobile and desktop applications.', repoUrl: 'https://github.com/angular/angular', liveUrl: 'https://angular.io/', stars: 95000, forks: 25100, language: 'TypeScript', techStack: ['TypeScript', 'Framework'], difficulty: 'HARD', topics: ['angular', 'typescript'] },
          { title: 'Svelte', description: 'Cybernetically enhanced web apps.', repoUrl: 'https://github.com/sveltejs/svelte', liveUrl: 'https://svelte.dev/', stars: 78000, forks: 4100, language: 'TypeScript', techStack: ['TypeScript', 'Compiler'], difficulty: 'MEDIUM', topics: ['svelte', 'compiler'] },
          { title: 'Express.js', description: 'Fast, unopinionated web framework for Node.js.', repoUrl: 'https://github.com/expressjs/express', liveUrl: 'https://expressjs.com/', stars: 64000, forks: 15700, language: 'JavaScript', techStack: ['Node.js', 'Backend'], difficulty: 'EASY', topics: ['express', 'nodejs'] },
          { title: 'Django', description: 'High-level Python web framework.', repoUrl: 'https://github.com/django/django', liveUrl: 'https://www.djangoproject.com/', stars: 78000, forks: 31500, language: 'Python', techStack: ['Python', 'Web'], difficulty: 'MEDIUM', topics: ['django', 'python'] },
          { title: 'Laravel', description: 'PHP web application framework.', repoUrl: 'https://github.com/laravel/laravel', liveUrl: 'https://laravel.com/', stars: 77000, forks: 24000, language: 'PHP', techStack: ['PHP', 'MVC'], difficulty: 'MEDIUM', topics: ['laravel', 'php'] },
          { title: 'Flask', description: 'Lightweight WSGI web application framework.', repoUrl: 'https://github.com/pallets/flask', liveUrl: 'https://flask.palletsprojects.com/', stars: 67000, forks: 16100, language: 'Python', techStack: ['Python', 'Microframework'], difficulty: 'EASY', topics: ['flask', 'python'] },
          { title: 'Ruby on Rails', description: 'Server-side web application framework.', repoUrl: 'https://github.com/rails/rails', liveUrl: 'https://rubyonrails.org/', stars: 55000, forks: 21500, language: 'Ruby', techStack: ['Ruby', 'MVC'], difficulty: 'MEDIUM', topics: ['rails', 'ruby'] },
        ]
      },
      // AI & Machine Learning
      {
        domain: 'artificial-intelligence',
        projects: [
          { title: 'TensorFlow', description: 'End-to-end open source platform for machine learning.', repoUrl: 'https://github.com/tensorflow/tensorflow', liveUrl: 'https://www.tensorflow.org/', stars: 185000, forks: 74000, language: 'C++', techStack: ['Python', 'C++', 'ML'], difficulty: 'HARD', topics: ['tensorflow', 'machine-learning'] },
          { title: 'PyTorch', description: 'Tensors and Dynamic neural networks in Python.', repoUrl: 'https://github.com/pytorch/pytorch', liveUrl: 'https://pytorch.org/', stars: 81000, forks: 21800, language: 'Python', techStack: ['Python', 'Deep Learning'], difficulty: 'HARD', topics: ['pytorch', 'deep-learning'] },
          { title: 'Keras', description: 'Deep Learning for humans.', repoUrl: 'https://github.com/keras-team/keras', liveUrl: 'https://keras.io/', stars: 61000, forks: 19400, language: 'Python', techStack: ['Python', 'Neural Networks'], difficulty: 'MEDIUM', topics: ['keras', 'deep-learning'] },
          { title: 'Scikit-learn', description: 'Machine Learning in Python.', repoUrl: 'https://github.com/scikit-learn/scikit-learn', liveUrl: 'https://scikit-learn.org/', stars: 59000, forks: 25200, language: 'Python', techStack: ['Python', 'ML'], difficulty: 'MEDIUM', topics: ['scikit-learn', 'machine-learning'] },
          { title: 'FastAI', description: 'Deep learning library.', repoUrl: 'https://github.com/fastai/fastai', liveUrl: 'https://www.fast.ai/', stars: 26000, forks: 7500, language: 'Python', techStack: ['Python', 'PyTorch'], difficulty: 'MEDIUM', topics: ['fastai', 'deep-learning'] },
          { title: 'Hugging Face Transformers', description: 'State-of-the-art NLP models.', repoUrl: 'https://github.com/huggingface/transformers', liveUrl: 'https://huggingface.co/', stars: 130000, forks: 26000, language: 'Python', techStack: ['Python', 'NLP'], difficulty: 'HARD', topics: ['nlp', 'transformers'] },
          { title: 'OpenCV', description: 'Open Source Computer Vision Library.', repoUrl: 'https://github.com/opencv/opencv', liveUrl: 'https://opencv.org/', stars: 77000, forks: 55700, language: 'C++', techStack: ['C++', 'Computer Vision'], difficulty: 'HARD', topics: ['opencv', 'computer-vision'] },
          { title: 'YOLO', description: 'Real-time object detection.', repoUrl: 'https://github.com/ultralytics/yolov5', liveUrl: null, stars: 48000, forks: 16000, language: 'Python', techStack: ['Python', 'PyTorch'], difficulty: 'HARD', topics: ['object-detection', 'yolo'] },
          { title: 'Detectron2', description: 'Object detection platform by Facebook AI.', repoUrl: 'https://github.com/facebookresearch/detectron2', liveUrl: null, stars: 29000, forks: 7200, language: 'Python', techStack: ['Python', 'PyTorch'], difficulty: 'HARD', topics: ['object-detection', 'computer-vision'] },
          { title: 'spaCy', description: 'Industrial-strength NLP library.', repoUrl: 'https://github.com/explosion/spaCy', liveUrl: 'https://spacy.io/', stars: 29000, forks: 4300, language: 'Python', techStack: ['Python', 'NLP'], difficulty: 'MEDIUM', topics: ['nlp', 'spacy'] },
        ]
      },
      // Machine Learning
      {
        domain: 'machine-learning',
        projects: [
          { title: 'ML.NET', description: 'Cross-platform ML framework for .NET.', repoUrl: 'https://github.com/dotnet/machinelearning', liveUrl: 'https://dotnet.microsoft.com/apps/machinelearning-ai/ml-dotnet', stars: 9000, forks: 1900, language: 'C#', techStack: ['C#', '.NET'], difficulty: 'MEDIUM', topics: ['ml', 'dotnet'] },
          { title: 'XGBoost', description: 'Scalable machine learning system.', repoUrl: 'https://github.com/dmlc/xgboost', liveUrl: 'https://xgboost.ai/', stars: 26000, forks: 8700, language: 'C++', techStack: ['C++', 'Python'], difficulty: 'HARD', topics: ['xgboost', 'gradient-boosting'] },
          { title: 'LightGBM', description: 'Fast gradient boosting framework.', repoUrl: 'https://github.com/microsoft/LightGBM', liveUrl: null, stars: 16000, forks: 3800, language: 'C++', techStack: ['C++', 'Python'], difficulty: 'MEDIUM', topics: ['lightgbm', 'gradient-boosting'] },
          { title: 'CatBoost', description: 'Gradient boosting library.', repoUrl: 'https://github.com/catboost/catboost', liveUrl: 'https://catboost.ai/', stars: 8000, forks: 1200, language: 'C++', techStack: ['C++', 'Python'], difficulty: 'MEDIUM', topics: ['catboost', 'gradient-boosting'] },
          { title: 'Prophet', description: 'Time series forecasting tool.', repoUrl: 'https://github.com/facebook/prophet', liveUrl: 'https://facebook.github.io/prophet/', stars: 18000, forks: 4500, language: 'Python', techStack: ['Python', 'R'], difficulty: 'EASY', topics: ['forecasting', 'time-series'] },
          { title: 'AutoML', description: 'Automated machine learning toolkit.', repoUrl: 'https://github.com/automl/auto-sklearn', liveUrl: null, stars: 7400, forks: 1200, language: 'Python', techStack: ['Python', 'AutoML'], difficulty: 'MEDIUM', topics: ['automl', 'machine-learning'] },
          { title: 'PyCaret', description: 'Low-code ML library.', repoUrl: 'https://github.com/pycaret/pycaret', liveUrl: 'https://pycaret.org/', stars: 8700, forks: 1800, language: 'Python', techStack: ['Python', 'AutoML'], difficulty: 'EASY', topics: ['pycaret', 'automl'] },
          { title: 'MLflow', description: 'Platform for ML lifecycle.', repoUrl: 'https://github.com/mlflow/mlflow', liveUrl: 'https://mlflow.org/', stars: 18000, forks: 4100, language: 'Python', techStack: ['Python', 'MLOps'], difficulty: 'MEDIUM', topics: ['mlflow', 'mlops'] },
          { title: 'Kubeflow', description: 'ML toolkit for Kubernetes.', repoUrl: 'https://github.com/kubeflow/kubeflow', liveUrl: 'https://www.kubeflow.org/', stars: 14000, forks: 2200, language: 'Go', techStack: ['Go', 'Kubernetes'], difficulty: 'HARD', topics: ['kubeflow', 'kubernetes'] },
          { title: 'ONNX', description: 'Open Neural Network Exchange.', repoUrl: 'https://github.com/onnx/onnx', liveUrl: 'https://onnx.ai/', stars: 17000, forks: 3700, language: 'Python', techStack: ['Python', 'C++'], difficulty: 'HARD', topics: ['onnx', 'neural-networks'] },
        ]
      },
      // Data Science
      {
        domain: 'data-science',
        projects: [
          { title: 'Pandas', description: 'Powerful data analysis toolkit.', repoUrl: 'https://github.com/pandas-dev/pandas', liveUrl: 'https://pandas.pydata.org/', stars: 43000, forks: 17700, language: 'Python', techStack: ['Python', 'Data Analysis'], difficulty: 'MEDIUM', topics: ['pandas', 'data-analysis'] },
          { title: 'NumPy', description: 'Fundamental package for scientific computing.', repoUrl: 'https://github.com/numpy/numpy', liveUrl: 'https://numpy.org/', stars: 27000, forks: 9700, language: 'Python', techStack: ['Python', 'C'], difficulty: 'MEDIUM', topics: ['numpy', 'scientific-computing'] },
          { title: 'Matplotlib', description: 'Comprehensive data visualization library.', repoUrl: 'https://github.com/matplotlib/matplotlib', liveUrl: 'https://matplotlib.org/', stars: 19000, forks: 7600, language: 'Python', techStack: ['Python', 'Visualization'], difficulty: 'EASY', topics: ['matplotlib', 'visualization'] },
          { title: 'Jupyter', description: 'Interactive computing environment.', repoUrl: 'https://github.com/jupyter/notebook', liveUrl: 'https://jupyter.org/', stars: 11000, forks: 4700, language: 'Python', techStack: ['Python', 'JavaScript'], difficulty: 'MEDIUM', topics: ['jupyter', 'notebooks'] },
          { title: 'Plotly', description: 'Interactive graphing library.', repoUrl: 'https://github.com/plotly/plotly.py', liveUrl: 'https://plotly.com/', stars: 15000, forks: 2500, language: 'Python', techStack: ['Python', 'JavaScript'], difficulty: 'EASY', topics: ['plotly', 'visualization'] },
          { title: 'Seaborn', description: 'Statistical data visualization.', repoUrl: 'https://github.com/mwaskom/seaborn', liveUrl: 'https://seaborn.pydata.org/', stars: 12000, forks: 1800, language: 'Python', techStack: ['Python', 'Matplotlib'], difficulty: 'EASY', topics: ['seaborn', 'visualization'] },
          { title: 'Apache Spark', description: 'Unified analytics engine for big data.', repoUrl: 'https://github.com/apache/spark', liveUrl: 'https://spark.apache.org/', stars: 39000, forks: 28200, language: 'Scala', techStack: ['Scala', 'Big Data'], difficulty: 'HARD', topics: ['spark', 'big-data'] },
          { title: 'Dask', description: 'Parallel computing library.', repoUrl: 'https://github.com/dask/dask', liveUrl: 'https://dask.org/', stars: 12000, forks: 1700, language: 'Python', techStack: ['Python', 'Parallel Computing'], difficulty: 'MEDIUM', topics: ['dask', 'parallel-computing'] },
          { title: 'Apache Airflow', description: 'Platform to programmatically author workflows.', repoUrl: 'https://github.com/apache/airflow', liveUrl: 'https://airflow.apache.org/', stars: 36000, forks: 14000, language: 'Python', techStack: ['Python', 'Workflow'], difficulty: 'HARD', topics: ['airflow', 'workflow'] },
          { title: 'Streamlit', description: 'Fastest way to build data apps.', repoUrl: 'https://github.com/streamlit/streamlit', liveUrl: 'https://streamlit.io/', stars: 33000, forks: 2900, language: 'Python', techStack: ['Python', 'Web'], difficulty: 'EASY', topics: ['streamlit', 'data-apps'] },
        ]
      }
    ];

    let totalInserted = 0;

    for (const { domain, projects } of projectsData) {
      const domainId = domainMap.get(domain);
      
      if (!domainId) {
        console.log(`⚠️ Domain not found: ${domain}, skipping...`);
        continue;
      }

      console.log(`\n📥 Seeding ${projects.length} projects for domain: ${domain}`);

      // Delete existing projects for this domain
      const deleted = await prisma.gitHubProject.deleteMany({
        where: { domainId }
      });
      console.log(`🗑️ Deleted ${deleted.count} existing projects`);

      // Insert new projects
      for (const proj of projects) {
        const repoInfo = extractRepoInfo(proj.repoUrl);
        
        await prisma.gitHubProject.create({
          data: {
            title: proj.title,
            description: proj.description,
            repoUrl: proj.repoUrl,
            repoOwner: repoInfo.owner,
            repoName: repoInfo.name,
            defaultBranch: repoInfo.branch,
            downloadUrl: `https://github.com/${repoInfo.owner}/${repoInfo.name}/archive/refs/heads/${repoInfo.branch}.zip`,
            liveUrl: proj.liveUrl,
            domainId,
            stars: proj.stars,
            forks: proj.forks,
            language: proj.language,
            techStack: proj.techStack,
            difficulty: proj.difficulty as any,
            topics: proj.topics,
            lastUpdated: new Date(),
          }
        });
      }

      totalInserted += projects.length;
      console.log(`✅ Inserted ${projects.length} projects for ${domain}`);
    }

    console.log(`\n✅ Successfully seeded ${totalInserted} unique GitHub projects!`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFromStaticData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
