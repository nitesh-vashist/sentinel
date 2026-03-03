🛡 Sentinel
Trial Integrity Intelligence Engine (TIIE)

A Cryptographic + AI Framework for Phase 3 Clinical Trial Data Integrity

📌 Overview

Sentinel is a regulator-oriented integrity platform designed to enhance transparency, immutability, and oversight in Phase 3 clinical trials.

It introduces:

🔐 Cryptographic visit-level locking

🔗 Patient-level hash chaining

🌳 Merkle tree batching

⛓ Public blockchain anchoring (Polygon)

🧠 Explainable AI-based anomaly detection

📊 Unified hospital risk scoring

Sentinel does not replace Electronic Data Capture (EDC) systems.

It acts as a tamper-evident oversight layer built for regulators.

🚨 The Problem

Phase 3 clinical trials determine whether a drug reaches the market.

At this stage:

Thousands of patients are involved

Multiple hospitals participate

Data directly influences regulatory approval

Financial stakes are extremely high

However, current systems rely heavily on:

Trust-based reporting

Internal audit logs

Manual audits

Retrospective statistical review

Structural gaps include:

Silent post-submission data edits

Backdated or batch data entry

Cross-patient templating

Delayed site-level anomaly detection

No independent cryptographic verification

The system is structured — but not tamper-evident.

🎯 Sentinel’s Core Mission

Sentinel transforms clinical trial oversight from:

Trust-based auditing

to

Cryptographically verifiable, risk-aware supervision.

It guarantees:

Post-submission tampering is detectable

Visit histories are immutable

Blockchain-anchored integrity proof exists

Suspicious hospital patterns are surfaced early

It does not claim to prove physical truth at measurement time.

It guarantees detectability of manipulation after submission.

🏗 High-Level Architecture

Sentinel consists of five major layers:

Web Application Layer

Database & Access Control Layer

Cryptographic Integrity Layer

Blockchain Anchoring Layer

AI Intelligence Layer

Each layer is modular and independently verifiable.

🔒 Cryptographic Integrity Model
1️⃣ Visit-Level Hashing

When a hospital submits a patient visit:

A canonical snapshot of visit data is created.

CRF values are deterministically ordered.

A SHA-256 hash is generated.

The visit is locked permanently.

Hash format:

Hₙ = SHA256(previous_hash + visit_id + ordered_values)

Each patient forms a hash chain.

If any historical visit changes:

The chain breaks.

Tampering becomes detectable.

2️⃣ Merkle Tree Anchoring

Instead of anchoring every visit individually:

Unanchored visit hashes are grouped per trial.

Deterministically sorted.

A Merkle tree is constructed.

The Merkle root is generated.

Root is anchored on-chain.

Only the root is stored on-chain.

No patient data is exposed publicly.

3️⃣ Blockchain Integration

Anchoring is performed on:

Polygon (Amoy Testnet)

The smart contract stores:

Trial identifier hash

Day index

Merkle root

Regulators can:

Recompute Merkle root locally

Fetch on-chain root

Compare values

If mismatch occurs → tampering is detected.

This creates independent cryptographic proof beyond database trust.

🧠 AI — Trial Integrity Intelligence Engine (TIIE)

Sentinel includes a modular forensic AI engine.

It operates only on locked, immutable data.

No deep learning.
No black-box predictions.
Fully explainable logic.

AI Objectives
1️⃣ Statistical Abnormality Detection

Detects unnatural value distributions.

2️⃣ Behavioral Anomaly Detection

Analyzes submission timing patterns:

Backfilling

Burst entries

Operational irregularities

3️⃣ Cross-Patient Templating Detection

Identifies suspicious similarity between patient records.

4️⃣ Cross-Hospital Peer Deviation

Flags hospitals that systematically diverge from peers.

5️⃣ Unified Risk Aggregation

Produces:

Risk Score (0–100)

Risk Level (Low / Medium / High)

Top Contributing Signals

This allows regulators to prioritize audits intelligently.

🔄 End-to-End Workflow
1️⃣ Regulator Setup

Regulator account is seeded.

Full oversight privileges.

2️⃣ Hospital Registration

Hospital registers.

Regulator verifies and approves.

3️⃣ Trial Creation

Regulator defines trial metadata.

Defines CRF structure.

Invites hospitals.

4️⃣ Trial Activation

Hospitals accept invitation.

Trial becomes active.

5️⃣ Patient Enrollment

Hospitals enroll anonymized subjects.

No PII stored.

6️⃣ Visit Submission

Hospital submits visit.

System generates hash.

Visit is locked.

Hash chain updated.

7️⃣ Merkle Anchoring

Visit hashes grouped.

Merkle root generated.

Root anchored to blockchain.

8️⃣ AI Execution

Statistical + behavioral + relational analysis.

Risk scores computed.

Signals persisted.

9️⃣ Regulator Oversight

View hospital risk levels.

Inspect raw data.

Verify blockchain integrity.

Prioritize audits.

🗃 Core Database Schema

Key tables:

users

hospitals

trials

trial_hospitals

trial_crf_fields

patients

visits

visit_values

visit_hashes

merkle_anchors

ai_runs

ai_hospital_scores

ai_anomaly_signals

Data is append-only and regulator-controlled.

🛠 Tech Stack
Frontend

Next.js (App Router)

Role-based dashboards

Backend

Supabase (PostgreSQL + Auth)

Row-Level Security (RLS)

Cryptography

SHA-256 hashing

Deterministic canonical ordering

Blockchain

Polygon (Amoy testnet)

Smart contract anchoring

Ethers.js integration

AI Engine

Python

Pandas

NumPy

Deterministic statistical logic

🔐 Security Principles

No patient PII stored

Only anonymized subject codes

Only hashes anchored on-chain

Deterministic reproducible hashing

Application-level immutability

Blockchain-backed verification

Explainable AI only

📊 What Sentinel Guarantees

✔ Post-submission tampering is detectable
✔ Hash chain break reveals manipulation
✔ Blockchain anchor mismatch reveals corruption
✔ Peer-relative anomaly visibility
✔ Transparent risk prioritization

🚫 What Sentinel Does NOT Do

✘ Does not prevent first-entry fabrication
✘ Does not replace EDC systems
✘ Does not automatically accuse hospitals
✘ Does not replace regulators

Human oversight remains central.

🧪 Current Status

Core Platform:

Trial lifecycle implemented

Visit locking implemented

Hash chaining implemented

Blockchain:

Merkle anchoring implemented

Smart contract deployed

Verification flow implemented

AI:

All 5 objectives implemented

Risk aggregation implemented

Regulator dashboard integrated

System is demo-ready and architecturally modular.

📈 Why This Project Matters

Clinical trial integrity affects:

Drug approvals

Public safety

Regulatory trust

Billions in financial decisions

Sentinel demonstrates how:

Cryptography

Blockchain

Explainable AI

can be combined to modernize regulatory oversight systems.

🧠 Author

Built as an end-to-end integrity architecture project demonstrating:

System design thinking

Cryptographic reasoning

Blockchain integration

AI-based anomaly detection

Regulator-oriented product thinking
