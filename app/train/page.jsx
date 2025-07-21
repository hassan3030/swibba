'use client'
import React from 'react'
import axios from "axios"

const TtainPage = () => {
const STATIC_ADMIN_TOKEN =  'wQuBWUjR0p4_3Rz2BIeHAnkiK5f7GDaR';
const FLOW_ID_FROM_PREVIOUS_STEP = "ed5ad5e3-e129-447e-99ba-0639f857d21a"
const directus = axios.create({
  baseURL: "http://localhost:8055",
  headers: {
    Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
  },
});

async function createFlow() {
  try {
    // 1) Create the flow
    const flowRes = await directus.post("/flows", {
      name: "New User Welcome Email",
      icon: "email",
      color: "green",
      description: "Send welcome email when user registers",
      trigger: "event",
      status: "active",
      options: {
        event: {
          collection: "directus_users",
          action: "create",
        },
      },
    });

    const flowId = flowRes.data.data.id;
    console.log("✅ Flow created:", flowId);

    // 2) Create an operation inside this flow
    const opRes = await directus.post("/operations", {
      name: "Send Welcome Email",
      key: "send_welcome_email",
      type: "mail",
      options: {
        to: "{{ $trigger.email }}",
        subject: "Welcome to Our App!",
        body: "Hello {{ $trigger.first_name }}, thanks for joining!",
      },
      flow: flowId, // REQUIRED
    });

    console.log("✅ Operation created:", opRes.data.data.id);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}



  return (
    <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <button type="button" onClick={()=>{createFlow()}}>createFlow</button><br />

    </div>
  )
}

export default TtainPage