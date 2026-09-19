## FOOTBALL ANALYTICS

A football analytics and player recommendation system built using
Machine Learning, PyTorch, and Flask.

The project explores football player data to identify suitable
players based on their attributes, playing roles, and similarity
to a given scouting requirement.

## 🚀 Features

- Player data analysis and preprocessing
- Feature scaling and numerical feature selection
- PyTorch-based two-tower recommendation model
- Role-based player recommendations
- Player embeddings for similarity-based retrieval
- Flask API for serving recommendations
- Top-K player recommendations
- Scalable backend structure for future analytics features

## 🧠 Machine Learning

The recommendation system uses a **Two-Tower Neural Network**.

### Query Tower
Processes the scouting requirement, such as a preferred
playing role.

### Player Tower
Learns representations of football players using their
attributes.

### Recommendation
The query and player embeddings are compared using similarity
scores to retrieve relevant players.

## 🛠️ Tech Stack

- Python
- PyTorch
- Pandas
- NumPy
- Scikit-learn
- Flask
- REST API

## 📊 Dataset

The project uses the EA Sports FC 24 Complete Player Dataset.

The dataset contains player attributes, positions, and other
football-related information used for analysis and modeling.


This repo was made by [Om Thakur](https://github.com/omat100) and [Trinav Sircar](https://github.com/TrinavS)
