# Chest-pain-Pathway

Gemini
What can Gemini do
in Google Drive
Summarize a topic
based on files in my Drive
Summarize a folder
in my Drive
Gemini for Workspace can make mistakes, including about people, so double-check it. Learn more
graph TD
    A[Patient with Chest Pain in ED] --> B{ECG: STEMI?};
    B -- Yes --> C[Activate STEMI Protocol];
    B -- No --> D[Initial Workup <br> hs-cTn, Repeat ECG, Assess for Ischemia];

    D --> E{ECG Concerning for Ischemia?};
    E -- Yes --> F{Symptoms suggest NSTE-ACS?};
    F -- Yes --> G{hs-cTn Elevated?};
    G -- Yes --> H[Consult Cardiology --> Admit];
    G -- No --> I[Proceed to Main Pathway];
    F -- No --> J[Consider Other Diagnoses];
    E -- No --> I;

    subgraph "Main Chest Pain Clinical Decision Pathway"
        I --> K[Stratify by hs-cTn & HEART Score];
        K -- "<b>Rapid Rule-Out hs-cTn</b><br>(Initial <3 OR Delta <3)<br>+<br><b>Low Risk HEART</b>" --> L[Discharge <br> PDC Follow-up in 14 days];
        K -- "<b>Myocardial Injury hs-cTn</b><br>(Initial >88 OR Delta >=22)<br>+<br><b>High Risk HEART</b>" --> M[Cardiology Fellow Consultation];
        K -- "<b>Gray Zone hs-cTn</b><br>+<br><b>Intermediate Risk HEART</b>" --> N[Shared Decision Making];
    end

    subgraph "Intermediate Risk Sub-Pathway"
        N -- Decision to Admit --> O{ED Observation Available?};
        N -- Decision to Discharge --> L;
        O -- No --> P[Admit to Medicine];
        O -- Yes --> Q[Place in ED Observation];
        Q --> R{Prior Normal Cardiac Testing?};
        R -- Yes --> S[Discharge <br> PDC Follow-up in 7 days];
        R -- No --> T{CTA Candidate?};
        T -- Yes --> U[Coronary CTA];
        U -- Normal --> S;
        U -- Abnormal --> V{Cardiology Consult: <br> Further Inpatient Eval Needed?};
        V -- No --> S;
        V -- Yes --> H;
        T -- No --> W[Consider non-invasive stress test];
    end
    
    style C fill:#ffcccc,stroke:#333,stroke-width:2px
    style H fill:#ffcccc,stroke:#333,stroke-width:2px
    style P fill:#ffcccc,stroke:#333,stroke-width:2px
    style L fill:#ccffcc,stroke:#333,stroke-width:2px
    style S fill:#ccffcc,stroke:#333,stroke-width:2px
