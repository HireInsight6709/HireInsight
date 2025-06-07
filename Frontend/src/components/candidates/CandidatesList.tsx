import React from 'react';
import { User, ThumbsUp, ThumbsDown } from 'lucide-react';
import CandidateFeedback from './CandidateFeedback';
import { useEffect,useState } from 'react';
import axios from 'axios';

interface Candidate {
  id: number;
  name: string;
  Job_Id: number;
  jobRole: string;
  interviewDate: string;
  interviewer: string;
  status: 'pending' | 'accepted' | 'rejected';
  feedback: {
    rating: number;
    comments: string;
    strengths: string[];
    improvements: string[];
  };
}

// Mock data
const mockCandidates: Candidate[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    Job_Id: 12,
    jobRole: 'Senior Frontend Developer',
    interviewDate: '2024-03-15',
    interviewer: 'John Smith',
    status: 'pending',
    feedback: {
      rating: 4,
      comments: 'Strong technical skills and great communication',
      strengths: ['React expertise', 'Problem-solving'],
      improvements: ['System design knowledge'],
    },
  },
  // Add more mock candidates
];

export default function CandidatesList() {
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [data , setData] = useState<Candidate[]>([]);

  const handleDecision = (candidateId: number, decision: 'Accepted' | 'Rejected', job_Id: number) => {
    // Here you would make an API call to update the candidate status
    console.log(`Candidate ${candidateId} ${decision} and has job_id ${job_Id}`);
    axios.post(`http://localhost:${import.meta.env.VITE_PORT}/api/v1/candidatesList/`, {decision,candidateId,job_Id}, { withCredentials : true })
  };

  useEffect(()=>{
      const fetchData = async()=>{
        const information = await axios.get(
            `http://localhost:${import.meta.env.VITE_PORT}/api/v1/candidatesList/`, 
            { withCredentials : true }
          )
          console.log(information);
          setData(information.data.information);
        }
      fetchData();
    },[])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {data.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-500">{candidate.jobRole}</p>
                  <p className="text-sm text-gray-500">
                    Interviewed by {candidate.interviewer} on{' '}
                    {new Date(candidate.interviewDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {candidate.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDecision(candidate.id, 'Accepted',candidate.Job_Id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecision(candidate.id, 'Rejected',candidate.Job_Id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              )}
              
              {candidate.status !== 'pending' && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  candidate.status === 'accepted' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {candidate.status === 'accepted' ? 'Accepted' : 'Rejected'}
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedCandidate(candidate)}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
            >
              View Interview Feedback
            </button>
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <CandidateFeedback
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}