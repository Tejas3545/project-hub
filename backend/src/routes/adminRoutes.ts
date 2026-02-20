import { Router } from 'express';
import prisma from '../utils/prisma';
import { githubUpdateService } from '../services/githubUpdateService';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, validateParams, uuidParamSchema } from '../middleware/validation';
import { z } from 'zod'; // For custom schemas if needed
import bcrypt from 'bcryptjs';

const router = Router();

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

/**
 * POST /api/admin/seed-projects
 * Seeds unique GitHub projects - Admin only
 */
router.post('/seed-projects', authenticate, requireAdmin, async (req, res) => {
  try {
    // Auth handled by middleware

    const domains = await prisma.domain.findMany();
    const domainMap = new Map<string, string>();

    for (const domain of domains) {
      domainMap.set(domain.slug, domain.id);
    }

    const projectsData = [
      // Cybersecurity Projects
      {
        domain: 'cybersecurity',
        projects: [
          { title: 'OWASP ZAP', description: 'Web app security scanner', repoUrl: 'https://github.com/zaproxy/zaproxy', liveUrl: 'https://www.zaproxy.org/', stars: 12500, forks: 2200, language: 'Java', techStack: ['Java', 'Security'], difficulty: 'HARD', topics: ['security'] },
          { title: 'Metasploit Framework', description: 'Penetration testing framework', repoUrl: 'https://github.com/rapid7/metasploit-framework', liveUrl: 'https://www.metasploit.com/', stars: 33000, forks: 13500, language: 'Ruby', techStack: ['Ruby'], difficulty: 'HARD', topics: ['security'] },
          { title: 'Nmap', description: 'Network discovery tool', repoUrl: 'https://github.com/nmap/nmap', liveUrl: 'https://nmap.org/', stars: 9800, forks: 2400, language: 'C', techStack: ['C'], difficulty: 'MEDIUM', topics: ['network'] },
          { title: 'Wireshark', description: 'Network protocol analyzer', repoUrl: 'https://github.com/wireshark/wireshark', liveUrl: 'https://www.wireshark.org/', stars: 6500, forks: 1800, language: 'C', techStack: ['C'], difficulty: 'HARD', topics: ['network'] },
          { title: 'John the Ripper', description: 'Password cracker', repoUrl: 'https://github.com/openwall/john', liveUrl: 'https://www.openwall.com/john/', stars: 9200, forks: 2100, language: 'C', techStack: ['C'], difficulty: 'MEDIUM', topics: ['password'] },
          { title: 'SQLMap', description: 'SQL injection tool', repoUrl: 'https://github.com/sqlmapproject/sqlmap', liveUrl: 'https://sqlmap.org/', stars: 31000, forks: 5700, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['sql'] },
          { title: 'Aircrack-ng', description: 'WiFi security tools', repoUrl: 'https://github.com/aircrack-ng/aircrack-ng', liveUrl: 'https://www.aircrack-ng.org/', stars: 5200, forks: 1200, language: 'C', techStack: ['C'], difficulty: 'MEDIUM', topics: ['wifi'] },
          { title: 'Hashcat', description: 'Password cracker', repoUrl: 'https://github.com/hashcat/hashcat', liveUrl: 'https://hashcat.net/', stars: 20500, forks: 2700, language: 'C', techStack: ['C'], difficulty: 'HARD', topics: ['password'] },
          { title: 'Snort', description: 'Intrusion detection', repoUrl: 'https://github.com/snort3/snort3', liveUrl: 'https://www.snort.org/', stars: 2800, forks: 680, language: 'C++', techStack: ['C++'], difficulty: 'HARD', topics: ['ids'] },
          { title: 'Kali Tools', description: 'Pentesting tools collection', repoUrl: 'https://github.com/LionSec/katoolin', liveUrl: null, stars: 3100, forks: 890, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['kali'] },
        ]
      },
      // Web Development
      {
        domain: 'web-development',
        projects: [
          { title: 'React', description: 'JavaScript UI library', repoUrl: 'https://github.com/facebook/react', liveUrl: 'https://react.dev/', stars: 227000, forks: 46300, language: 'JavaScript', techStack: ['JavaScript'], difficulty: 'MEDIUM', topics: ['react'] },
          { title: 'Vue.js', description: 'Progressive framework', repoUrl: 'https://github.com/vuejs/vue', liveUrl: 'https://vuejs.org/', stars: 207000, forks: 33700, language: 'JavaScript', techStack: ['JavaScript'], difficulty: 'EASY', topics: ['vue'] },
          { title: 'Next.js', description: 'React framework', repoUrl: 'https://github.com/vercel/next.js', liveUrl: 'https://nextjs.org/', stars: 125000, forks: 26700, language: 'JavaScript', techStack: ['React'], difficulty: 'MEDIUM', topics: ['nextjs'] },
          { title: 'Angular', description: 'Web application platform', repoUrl: 'https://github.com/angular/angular', liveUrl: 'https://angular.io/', stars: 95000, forks: 25100, language: 'TypeScript', techStack: ['TypeScript'], difficulty: 'HARD', topics: ['angular'] },
          { title: 'Svelte', description: 'Web app compiler', repoUrl: 'https://github.com/sveltejs/svelte', liveUrl: 'https://svelte.dev/', stars: 78000, forks: 4100, language: 'TypeScript', techStack: ['TypeScript'], difficulty: 'MEDIUM', topics: ['svelte'] },
          { title: 'Express.js', description: 'Node.js web framework', repoUrl: 'https://github.com/expressjs/express', liveUrl: 'https://expressjs.com/', stars: 64000, forks: 15700, language: 'JavaScript', techStack: ['Node.js'], difficulty: 'EASY', topics: ['express'] },
          { title: 'Django', description: 'Python web framework', repoUrl: 'https://github.com/django/django', liveUrl: 'https://www.djangoproject.com/', stars: 78000, forks: 31500, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['django'] },
          { title: 'Laravel', description: 'PHP web framework', repoUrl: 'https://github.com/laravel/laravel', liveUrl: 'https://laravel.com/', stars: 77000, forks: 24000, language: 'PHP', techStack: ['PHP'], difficulty: 'MEDIUM', topics: ['laravel'] },
          { title: 'Flask', description: 'Python microframework', repoUrl: 'https://github.com/pallets/flask', liveUrl: 'https://flask.palletsprojects.com/', stars: 67000, forks: 16100, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['flask'] },
          { title: 'Ruby on Rails', description: 'Web framework', repoUrl: 'https://github.com/rails/rails', liveUrl: 'https://rubyonrails.org/', stars: 55000, forks: 21500, language: 'Ruby', techStack: ['Ruby'], difficulty: 'MEDIUM', topics: ['rails'] },
        ]
      },
      // AI
      {
        domain: 'artificial-intelligence',
        projects: [
          { title: 'TensorFlow', description: 'ML platform', repoUrl: 'https://github.com/tensorflow/tensorflow', liveUrl: 'https://www.tensorflow.org/', stars: 185000, forks: 74000, language: 'C++', techStack: ['Python', 'C++'], difficulty: 'HARD', topics: ['tensorflow'] },
          { title: 'PyTorch', description: 'Deep learning framework', repoUrl: 'https://github.com/pytorch/pytorch', liveUrl: 'https://pytorch.org/', stars: 81000, forks: 21800, language: 'Python', techStack: ['Python'], difficulty: 'HARD', topics: ['pytorch'] },
          { title: 'Keras', description: 'Deep learning API', repoUrl: 'https://github.com/keras-team/keras', liveUrl: 'https://keras.io/', stars: 61000, forks: 19400, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['keras'] },
          { title: 'Scikit-learn', description: 'ML in Python', repoUrl: 'https://github.com/scikit-learn/scikit-learn', liveUrl: 'https://scikit-learn.org/', stars: 59000, forks: 25200, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['sklearn'] },
          { title: 'FastAI', description: 'Deep learning library', repoUrl: 'https://github.com/fastai/fastai', liveUrl: 'https://www.fast.ai/', stars: 26000, forks: 7500, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['fastai'] },
          { title: 'Transformers', description: 'NLP models', repoUrl: 'https://github.com/huggingface/transformers', liveUrl: 'https://huggingface.co/', stars: 130000, forks: 26000, language: 'Python', techStack: ['Python'], difficulty: 'HARD', topics: ['nlp'] },
          { title: 'OpenCV', description: 'Computer vision library', repoUrl: 'https://github.com/opencv/opencv', liveUrl: 'https://opencv.org/', stars: 77000, forks: 55700, language: 'C++', techStack: ['C++'], difficulty: 'HARD', topics: ['cv'] },
          { title: 'YOLO', description: 'Object detection', repoUrl: 'https://github.com/ultralytics/yolov5', liveUrl: null, stars: 48000, forks: 16000, language: 'Python', techStack: ['Python'], difficulty: 'HARD', topics: ['yolo'] },
          { title: 'Detectron2', description: 'Object detection', repoUrl: 'https://github.com/facebookresearch/detectron2', liveUrl: null, stars: 29000, forks: 7200, language: 'Python', techStack: ['Python'], difficulty: 'HARD', topics: ['detection'] },
          { title: 'spaCy', description: 'NLP library', repoUrl: 'https://github.com/explosion/spaCy', liveUrl: 'https://spacy.io/', stars: 29000, forks: 4300, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['nlp'] },
        ]
      },
      // ML
      {
        domain: 'machine-learning',
        projects: [
          { title: 'ML.NET', description: '.NET ML framework', repoUrl: 'https://github.com/dotnet/machinelearning', liveUrl: 'https://dotnet.microsoft.com/apps/machinelearning-ai/ml-dotnet', stars: 9000, forks: 1900, language: 'C#', techStack: ['C#'], difficulty: 'MEDIUM', topics: ['ml'] },
          { title: 'XGBoost', description: 'Gradient boosting', repoUrl: 'https://github.com/dmlc/xgboost', liveUrl: 'https://xgboost.ai/', stars: 26000, forks: 8700, language: 'C++', techStack: ['C++'], difficulty: 'HARD', topics: ['xgboost'] },
          { title: 'LightGBM', description: 'Gradient boosting', repoUrl: 'https://github.com/microsoft/LightGBM', liveUrl: null, stars: 16000, forks: 3800, language: 'C++', techStack: ['C++'], difficulty: 'MEDIUM', topics: ['lightgbm'] },
          { title: 'CatBoost', description: 'Gradient boosting', repoUrl: 'https://github.com/catboost/catboost', liveUrl: 'https://catboost.ai/', stars: 8000, forks: 1200, language: 'C++', techStack: ['C++'], difficulty: 'MEDIUM', topics: ['catboost'] },
          { title: 'Prophet', description: 'Time series forecasting', repoUrl: 'https://github.com/facebook/prophet', liveUrl: 'https://facebook.github.io/prophet/', stars: 18000, forks: 4500, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['forecasting'] },
          { title: 'Auto-sklearn', description: 'AutoML toolkit', repoUrl: 'https://github.com/automl/auto-sklearn', liveUrl: null, stars: 7400, forks: 1200, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['automl'] },
          { title: 'PyCaret', description: 'Low-code ML', repoUrl: 'https://github.com/pycaret/pycaret', liveUrl: 'https://pycaret.org/', stars: 8700, forks: 1800, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['pycaret'] },
          { title: 'MLflow', description: 'ML lifecycle platform', repoUrl: 'https://github.com/mlflow/mlflow', liveUrl: 'https://mlflow.org/', stars: 18000, forks: 4100, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['mlflow'] },
          { title: 'Kubeflow', description: 'ML on Kubernetes', repoUrl: 'https://github.com/kubeflow/kubeflow', liveUrl: 'https://www.kubeflow.org/', stars: 14000, forks: 2200, language: 'Go', techStack: ['Go'], difficulty: 'HARD', topics: ['kubeflow'] },
          { title: 'ONNX', description: 'Neural network exchange', repoUrl: 'https://github.com/onnx/onnx', liveUrl: 'https://onnx.ai/', stars: 17000, forks: 3700, language: 'Python', techStack: ['Python'], difficulty: 'HARD', topics: ['onnx'] },
        ]
      },
      // Data Science
      {
        domain: 'data-science',
        projects: [
          { title: 'Pandas', description: 'Data analysis toolkit', repoUrl: 'https://github.com/pandas-dev/pandas', liveUrl: 'https://pandas.pydata.org/', stars: 43000, forks: 17700, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['pandas'] },
          { title: 'NumPy', description: 'Scientific computing package', repoUrl: 'https://github.com/numpy/numpy', liveUrl: 'https://numpy.org/', stars: 27000, forks: 9700, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['numpy'] },
          { title: 'Matplotlib', description: 'Data visualization', repoUrl: 'https://github.com/matplotlib/matplotlib', liveUrl: 'https://matplotlib.org/', stars: 19000, forks: 7600, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['matplotlib'] },
          { title: 'Jupyter', description: 'Interactive computing', repoUrl: 'https://github.com/jupyter/notebook', liveUrl: 'https://jupyter.org/', stars: 11000, forks: 4700, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['jupyter'] },
          { title: 'Plotly', description: 'Interactive graphing', repoUrl: 'https://github.com/plotly/plotly.py', liveUrl: 'https://plotly.com/', stars: 15000, forks: 2500, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['plotly'] },
          { title: 'Seaborn', description: 'Statistical visualization', repoUrl: 'https://github.com/mwaskom/seaborn', liveUrl: 'https://seaborn.pydata.org/', stars: 12000, forks: 1800, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['seaborn'] },
          { title: 'Apache Spark', description: 'Big data analytics', repoUrl: 'https://github.com/apache/spark', liveUrl: 'https://spark.apache.org/', stars: 39000, forks: 28200, language: 'Scala', techStack: ['Scala'], difficulty: 'HARD', topics: ['spark'] },
          { title: 'Dask', description: 'Parallel computing', repoUrl: 'https://github.com/dask/dask', liveUrl: 'https://dask.org/', stars: 12000, forks: 1700, language: 'Python', techStack: ['Python'], difficulty: 'MEDIUM', topics: ['dask'] },
          { title: 'Apache Airflow', description: 'Workflow platform', repoUrl: 'https://github.com/apache/airflow', liveUrl: 'https://airflow.apache.org/', stars: 36000, forks: 14000, language: 'Python', techStack: ['Python'], difficulty: 'HARD', topics: ['airflow'] },
          { title: 'Streamlit', description: 'Data app framework', repoUrl: 'https://github.com/streamlit/streamlit', liveUrl: 'https://streamlit.io/', stars: 33000, forks: 2900, language: 'Python', techStack: ['Python'], difficulty: 'EASY', topics: ['streamlit'] },
        ]
      }
    ];

    let totalInserted = 0;

    for (const { domain, projects } of projectsData) {
      const domainId = domainMap.get(domain);
      if (!domainId) continue;

      // Delete existing
      await prisma.gitHubProject.deleteMany({ where: { domainId } });

      // Insert new
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
    }

    res.json({ success: true, message: `Seeded ${totalInserted} unique projects` });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Seeding failed' });
  }
});

/**
 * POST /api/admin/update-github-projects
 * Manually trigger GitHub projects update from real GitHub repos
 */
router.post('/update-github-projects', authenticate, requireAdmin, async (req, res) => {
  try {
    // Auth handled by middleware

    // Trigger async update
    githubUpdateService.triggerManualUpdate().catch(console.error);

    res.json({
      success: true,
      message: 'GitHub projects update started. Check server logs for progress.'
    });
  } catch (error) {
    console.error('Update trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger update' });
  }
});

/**
 * GET /api/admin/project-stats
 * Get current project statistics by domain
 */
router.get('/project-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Auth handled by middleware

    const domains = await prisma.domain.findMany({
      include: {
        _count: {
          select: {
            githubProjects: true,
            projects: true
          }
        }
      }
    });

    const stats = domains.map(domain => ({
      name: domain.name,
      slug: domain.slug,
      githubProjects: domain._count.githubProjects,
      regularProjects: domain._count.projects,
      total: domain._count.githubProjects + domain._count.projects,
      status: domain._count.githubProjects >= 100 ? 'complete' : 'needs_more'
    }));

    const totalGitHubProjects = stats.reduce((sum, s) => sum + s.githubProjects, 0);
    const totalProjects = stats.reduce((sum, s) => sum + s.total, 0);

    res.json({
      domains: stats,
      summary: {
        totalGitHubProjects,
        totalProjects,
        targetMet: stats.every(s => s.githubProjects >= 100)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * POST /api/admin/create-user
 * Create a new user (Admin only)
 */
router.post('/create-user', authenticate, requireAdmin, async (req, res) => {
  try {
    // Auth handled by middleware

    const { email, password, firstName, lastName, role = 'STUDENT' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role as 'STUDENT' | 'ADMIN',
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * GET /api/admin/users
 * Get all users (Admin only)
 */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    // Auth handled by middleware

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (Admin only)
 */
router.delete('/users/:id', authenticate, requireAdmin, validateParams(uuidParamSchema), async (req, res) => {
  try {
    // Auth handled by middleware

    const id = req.params.id as string;

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
