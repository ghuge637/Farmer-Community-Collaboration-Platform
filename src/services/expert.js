import api from "../services/api";


export function applyForExpert(data) {
  return api.post("/expert/apply", data);
}

export function getVerifiedExperts() {
  return api.get("/expert/verified");
}

export default { applyForExpert, getVerifiedExperts };
