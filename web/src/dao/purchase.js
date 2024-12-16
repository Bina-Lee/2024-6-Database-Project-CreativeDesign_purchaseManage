const pool = require('../config/database');

// RequestPurchase 테이블에 데이터 삽입
exports.insertRequestPurchase = async ({ itemName, link, itemPrice, quantity, option, purpose }) => {
    const query = `
      INSERT INTO RequestPurchase (itemName, link, itemPrice, quantity, \`option\`, purpose) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [itemName, link, itemPrice, quantity, option, purpose]);
    return result.insertId; // 삽입된 requestPurchaseId 반환
};

// 팀의 가장 최근 remainBudget 조회
exports.getLatestRemainBudget = async (teamId) => {
    const query = `
    SELECT remainBudget 
    FROM PurchaseRecord 
    WHERE teamId = ? 
    ORDER BY updateDateTime DESC 
    LIMIT 1
  `;
    const [rows] = await pool.query(query, [teamId]);
    return rows.length > 0 ? rows[0].remainBudget : null;
};

// 팀이 속한 프로젝트의 초기 예산 조회
exports.getProjectBudget = async (teamId) => {
    const query = `
    SELECT p.budget 
    FROM Project p
    JOIN Team t ON p.projectId = t.projectId
    WHERE t.teamId = ?
  `;
    const [rows] = await pool.query(query, [teamId]);
    console.log(rows, teamId);
    return rows[0].budget;
};

// PurchaseRecord 테이블에 기록 추가
exports.insertPurchaseRecord = async ({
    remainBudget,
    status,
    updateDateTime,
    teamId,
    requestPurchaseId,
    adminId,
}) => {
    const query = `
    INSERT INTO PurchaseRecord 
    (remainBudget, status, updateDateTime, teamId, requestPurchaseId, adminId)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    await pool.query(query, [remainBudget, status, updateDateTime, teamId, requestPurchaseId, adminId]);
};
