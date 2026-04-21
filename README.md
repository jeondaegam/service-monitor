
#### 프로젝트 구조

<pre>
📁 monitor-service  
├── docker-compose.yml            
│  
├── 📁 perf-monitor-portlet     ← React 앱  
│    └── Dockerfile  
│    └── vite.config.js          ← 외부 접근 설정    
│  
├── 📁 dotcms                   ← dotCMS  
│    └── Dockerfile  
│  
├── 📁 backend                  ← Spring Boot  
│    └── Dockerfile  
</pre>
