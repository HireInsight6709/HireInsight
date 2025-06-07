import axios from 'axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useEffect,useState } from 'react';

interface Application {
  id: number;
  job_Id : string;
  ApplicationStatus: 'Accepted' | 'Rejected' | '';
  jobRole: string;
  company_id: string;
  companyName: string;
  interviewer: string;
  interviewDate: string;
  status: 'Accepted' | 'Rejected' | 'Pending';
  feedback?: string;
}

// const mockApplications: Application[] = [
//   {
//     id: 1,
//     companyName: 'TechCorp',
//     jobRole: 'Senior Frontend Developer',
//     interviewDate: '2024-03-15',
//     interviewer: 'John Smith',
//     ApplicationStatus: 'Accepted',
//     status: 'Accepted',
//     feedback: 'Strong technical skills and great cultural fit.',
//   },
//   {
//     id: 2,
//     companyName: 'InnovateLabs',
//     jobRole: 'Full Stack Developer',
//     interviewDate: '2024-03-18',
//     interviewer: 'Sarah Johnson',
//     ApplicationStatus: 'Accepted',
//     status: 'Rejected',
//     feedback: 'Good technical skills but looking for more experience with our tech stack.',
//   },
//   {
//     id: 3,
//     companyName: 'StartupX',
//     jobRole: 'React Developer',
//     interviewDate: '2024-03-20',
//     interviewer: 'Mike Brown',
//     ApplicationStatus: 'Accepted',
//     status: 'Pending',
//   },
// ];

export default function ApplicationStatus() {
  const [mockApplications , setMockApplication] = useState<Application[]>([])
  useEffect(()=>{
    const fetchData = async()=>{
      try{
        const response = await axios.get(`http://localhost:${import.meta.env.VITE_PORT}/api/v1/status`,{ withCredentials : true });
        const information : Application[] = response.data.information; 
        console.log(information)
        setMockApplication(information);
      }catch(e){
        console.log(e)
      }
    };
    fetchData();
  },[])

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeColor = (status: Application['status']) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getApplicationStatusColor = (status: Application['ApplicationStatus']) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600';
      case 'Rejected':
        return 'text-red-800';
      case '':
        return 'text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {mockApplications.map((application) => (
        <div
          key={application.id}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">{application.jobRole}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{application.companyName}</p>
              <p className="text-sm text-gray-600">Application Status : <b className={`${getApplicationStatusColor(application.ApplicationStatus)}`}>{application.ApplicationStatus == '' ? 'Rejected' : application.ApplicationStatus}</b></p>
              <div className="text-sm text-gray-500">
                {/* Can't Get the required data directly making queries complex hence hidden */}
                {/* Interviewed by {application.interviewer} on {new Date(application.interviewDate).toLocaleDateString()} */}
              </div>
            </div>
            {getStatusIcon(application.status)}
          </div>
          {application.feedback && (
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Feedback:</p>
              <p className="mt-1">{application.feedback}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}