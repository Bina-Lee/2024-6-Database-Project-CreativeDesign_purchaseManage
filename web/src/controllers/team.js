const teamDAO = require('../dao/team');

exports.getAddTeamPage = async (req, res) => {
  try {
    const courses = await teamDAO.getCourses(); // 코스 목록 가져오기
    const projects = await teamDAO.getProjects(); // 프로젝트 목록 가져오기
    res.render('team_add', { courses, projects, error: null }); // error 기본값 설정
  } catch (err) {
    console.error(err);
    res.render('team_add', {
      courses: [],
      projects: [],
      error: '데이터를 불러오는 중 오류가 발생했습니다.',
    });
  }
};


// 팀 추가 처리
exports.postAddTeam = async (req, res) => {
  const { name, personnel, courseId, projectId } = req.body;

  try {
    await teamDAO.insertTeam(name, personnel, courseId, projectId);
    res.redirect('/admin/info'); // 팀 추가 후 관리자 페이지로 이동
  } catch (err) {
    console.error(err);
    res.render('team_add', { error: '팀 추가 중 오류가 발생했습니다.' });
  }
};

// 특정 프로젝트의 팀 리스트 조회
exports.getTeamsByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const teams = await teamDAO.getTeamsByProject(projectId);
    res.json(teams); // JSON 형식으로 팀 리스트 반환
  } catch (err) {
    console.error('Error fetching teams by project:', err);
    res.status(500).send('Internal Server Error');
  }
};

// 팀 상세 정보 가져오기
exports.getTeamDetails = async (req, res) => {
  const { teamId } = req.params;

  try {
    // 팀 멤버 가져오기
    const teamMembers = await teamDAO.getTeamMembers(teamId);

    // 구매 기록과 itemName 가져오기
    const purchaseRecords = await teamDAO.getPurchaseRecords(teamId);

    res.render('team_details', { teamMembers, purchaseRecords });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};