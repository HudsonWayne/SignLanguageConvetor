export default function JobCard({ job }: any) {
  return (
    <div className="bg-white shadow-xl rounded-3xl p-7 border border-gray-200 hover:scale-[1.02] transition-transform">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {job.job_title}
      </h2>

      <div className="text-gray-600 mb-4">
        {job.employer_name} • {job.job_city || "Remote"}
      </div>

      <p className="text-gray-700 leading-relaxed mb-6">
        {job.job_description?.slice(0, 250)}...
      </p>

      <div className="font-bold text-green-700 mb-4">
        Salary: {job.job_salary_currency} {job.job_min_salary || "?"} - {job.job_max_salary || "?"}
      </div>

      <a
        target="_blank"
        href={job.job_apply_link}
        className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg"
      >
        Apply Now
      </a>
    </div>
  );
}
