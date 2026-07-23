services:
  - type: web
    name: piphex-ai
    runtime: node
    plan: free
    buildCommand: ""
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: OPENAI_MODEL
        value: gpt-5.6-luna
