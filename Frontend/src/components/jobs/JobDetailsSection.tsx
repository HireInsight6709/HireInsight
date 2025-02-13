import { JobPostingData } from './JobPostingForm';

interface JobDetailsSectionProps {
  data: JobPostingData;
  onChange: (updates: Partial<JobPostingData>) => void;
}

export default function JobDetailsSection({ data, onChange }: JobDetailsSectionProps) {
  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(Boolean);
    onChange({ skills });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="col-span-2">
          <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700">
            Job Role
          </label>
          <input
            type="text"
            id="jobRole"
            placeholder='UX Designer'
            value={data.jobRole}
            onChange={(e) => onChange({ jobRole: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
           Department
          </label>
          <input
            type="text"
            id="department"
            placeholder='Ex. Engineering'
            value={data.department}
            onChange={(e) => onChange({ department: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            placeholder='Ex. Chicago'
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder='We are seeking a creative and detail-oriented UX Designer to join our team. As a UX Designer, you will play a key role in designing intuitive and engaging user experiences for our digital products. You will collaborate closely with product managers, developers, and other designers to create wireframes, prototypes, and user flows that enhance usability and delight our users.'
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700">
            Minimum Salary
          </label>
          <input
            type="text"
            id="salaryMin"
            placeholder='$3,000'
            value={data.salaryMin}
            onChange={(e) => onChange({ salaryMin: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700">
            Maximum Salary
          </label>
          <input
            type="text"
            id="salaryMax"
            placeholder='$3,500'
            value={data.salaryMax}
            onChange={(e) => onChange({ salaryMax: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
            Required Experience
          </label>
          <input
            type="text"
            id="experience"
            value={data.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., 3+ years"
            required
          />
        </div>

        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
            Job Type
          </label>
          <select
            id="jobType"
            value={data.jobType}
            onChange={(e) => onChange({ jobType: e.target.value as JobPostingData['jobType'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="col-span-2">
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
            Required Skills
          </label>
          <input
            type="text"
            id="skills"
            value={data.skills.join(', ')}
            onChange={(e) => handleSkillsChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., React, Node.js, TypeScript"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
        </div>
      </div>
    </div>
  );
}