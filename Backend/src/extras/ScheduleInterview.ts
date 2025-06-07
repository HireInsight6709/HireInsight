import { Database } from "../Databases/Database"

const FindCandidateDetail = `
  SELECT CONCAT("firstName",' ',"lastName") AS "name"
  FROM "Candidate_Applications"
  WHERE "candidate_Id" = $1 AND "job_Id" = $2
`

const FindInterviewerDetail = `
  SELECT CONCAT("firstName",' ',"lastName") AS "name", "interviewer_Id"
  FROM "Interviewer_Applications"
  WHERE "job_Id" = $1 AND "status" = 'Accepted'
`

const SetInterview = `
  INSERT INTO "Interview" 
  ("Candidate_Id","Interview_Id","Job_Id","Meeting_Link","Candidate_Name","Interviewer_Name","Company_Id")
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`
const DeleteCandidateApplication = `
  DELETE FROM "Candidate_Applications" 
  WHERE "candidate_Id" = $1 AND "job_Id" = $2
`;

const GetCompanyID = `
  SELECT (company_id) FROM "Jobs" 
  WHERE "id" = $1
`;

async function ScheduleInterview(candidate_id: any, job_id: any) {
  console.log("🚀 Starting interview scheduling")
  
  try {
    // 1. Get candidate name
    console.log("🔍 Fetching candidate details")
    const candidateRes = await Database.query(FindCandidateDetail, [candidate_id, job_id])
    if (candidateRes.rows.length === 0) throw new Error("❌ Candidate not found")
    const candidate = candidateRes.rows[0]
    console.log("✅ Candidate found:", candidate.name)

    // 2. Get list of interviewers
    console.log("🔍 Fetching interviewer details")
    const interviewerRes = await Database.query(FindInterviewerDetail, [job_id])
    if (interviewerRes.rows.length === 0) {
      console.log("❌ No interviewers found");

      try {
        await Database.query(DeleteCandidateApplication, [candidate_id, job_id]);
        console.log("🗑️ Candidate application deleted due to no available interviewers");
      } catch (deleteError) {
        console.error("⚠️ Error while deleting candidate application:", deleteError);
      }

      return; // Exit early
    }


    const randomInterviewer = interviewerRes.rows[Math.floor(Math.random() * interviewerRes.rows.length)]
    console.log("✅ Interviewer selected:", randomInterviewer.name)

    // 3. Get Zoom access token
    const clientId = process.env.ZOOMCLIENTID
    const clientSecret = process.env.ZOOMCLIENTSECRET
    const accountId = process.env.ZOOMACCOUNTID

    if (!clientId || !clientSecret || !accountId) {
      throw new Error("❌ Missing Zoom credentials in .env")
    }

    console.log("🔐 Getting Zoom access token")
    const base64String = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const tokenRes = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${base64String}`
      }
    })

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text()
      throw new Error(`❌ Zoom token error: ${tokenRes.status} - ${errorBody}`)
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    console.log("✅ Zoom access token acquired")

    // 4. Create Zoom meeting
    const meetingPayload = {
      topic: 'Interview Session',
      type: 2,
      start_time: new Date('2024-09-30T10:30:00Z').toISOString(),
      duration: 30
    }

    console.log("📅 Creating Zoom meeting...")
    const meetingRes = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingPayload)
    })

    if (!meetingRes.ok) {
      const errorBody = await meetingRes.text()
      throw new Error(`❌ Zoom meeting creation error: ${meetingRes.status} - ${errorBody}`)
    }

    const meetingData = await meetingRes.json()
    const meetingLink = meetingData.join_url
    console.log("✅ Zoom meeting created:", meetingLink)

    const Company_id = await Database.query(GetCompanyID,[job_id]);

    // 5. Insert into Interview table
    console.log("💾 Inserting interview into database")
    const insertValues = [
      candidate_id,
      randomInterviewer.interviewer_Id,
      job_id,
      meetingLink,
      candidate.name,
      randomInterviewer.name,
      Company_id.rows[0].company_id
    ]

    const insertRes = await Database.query(SetInterview, insertValues)
    console.log("✅ Interview record inserted:", insertRes.rowCount)

  } catch (err: any) {
    console.error("❗ Error in ScheduleInterview:", err.message || err)
  }
}

export default ScheduleInterview
