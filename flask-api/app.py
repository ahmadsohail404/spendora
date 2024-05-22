from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
import joblib
import os

app = Flask(__name__)
CORS(app)

# Directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Load and preprocess the data
data = pd.read_csv(os.path.join(BASE_DIR, 'data', 'spendora_dataset.csv'))
data.columns = data.columns.str.strip()  # Remove any trailing whitespace in column names
vectorizer = CountVectorizer()
X_desc = vectorizer.fit_transform(data['Expense Description'])
X = pd.concat([pd.DataFrame(X_desc.toarray()), data[['Expense Amount']]], axis=1)

# Ensure all column names are strings to avoid issues in scikit-learn
X.columns = [str(i) for i in range(X.shape[1])]

y = LabelEncoder().fit_transform(data['Type of Expense'])

# Train the Logistic Regression model
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
clf = LogisticRegression(max_iter=1000, random_state=42)
clf.fit(X_scaled, y)

# Save the model and preprocessing objects
joblib.dump(clf, os.path.join(MODEL_DIR, 'model.pkl'))
joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))
joblib.dump(vectorizer, os.path.join(MODEL_DIR, 'vectorizer.pkl'))
label_encoder = LabelEncoder().fit(data['Type of Expense'])
joblib.dump(label_encoder, os.path.join(MODEL_DIR, 'label_encoder.pkl'))

# Load the label encoder only once
label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    desc = data['description']
    amount = data['amount']

    # Transform the input
    X_desc = vectorizer.transform([desc])
    X_input = pd.concat([pd.DataFrame(X_desc.toarray()), pd.DataFrame([amount])], axis=1)
    
    # Ensure all column names are strings
    X_input.columns = [str(i) for i in range(X_input.shape[1])]
    
    X_input_scaled = scaler.transform(X_input)

    # Make prediction
    prediction = clf.predict(X_input_scaled)
    prediction_label = label_encoder.inverse_transform(prediction)

    return jsonify({'prediction': prediction_label[0]})

if __name__ == '__main__':
    app.run(debug=True)
