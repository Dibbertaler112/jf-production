if (profile.role === "department_youth_representative") {
  router.replace("/youth/dashboard");
  return;
}
else {
  router.replace("/");
}