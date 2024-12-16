const purchaseDAO = require('../dao/purchase');

// 구매 요청 페이지 렌더링
exports.getPurchasePage = (req, res) => {
  const { teamId } = req.session; // 세션에 저장된 팀 ID
  res.render('purchase_request', { teamId, error: null });
};

// 구매 요청 처리
exports.postPurchaseRequest = async (req, res) => {
  const { itemName, link, itemPrice, quantity, option, purpose } = req.body;
  const teamId = req.session.teamId; // 세션에서 teamId 가져오기
  console.log(teamId);
  const adminId = 100000000; // 고정된 adminId
  const status = 'PENDING';
  const updateDateTime = new Date();
  const totalCost = itemPrice * quantity;

  try {
    // 1. RequestPurchase에 구매 요청 정보 삽입
    const requestPurchaseId = await purchaseDAO.insertRequestPurchase({
      itemName,
      link,
      itemPrice,
      quantity,
      option,
      purpose,
    });

    // 2. 가장 최근 PurchaseRecord에서 remainBudget 조회
    let remainBudget = await purchaseDAO.getLatestRemainBudget(teamId);

    if (remainBudget === null) {
      // 첫 기록인 경우 Project의 예산에서 차감
      const projectBudget = await purchaseDAO.getProjectBudget(teamId);
      remainBudget = projectBudget - totalCost;
    } else {
      // 기존 기록이 있는 경우 remainBudget에서 차감
      remainBudget -= totalCost;
    }

    if (remainBudget < 0) {
      return res.render('purchase_request', {
        teamId,
        error: '예산이 부족합니다.',
      });
    }

    // 3. PurchaseRecord에 기록 추가
    await purchaseDAO.insertPurchaseRecord({
      remainBudget,
      status,
      updateDateTime,
      teamId,
      requestPurchaseId,
      adminId,
    });

    res.redirect('/student/main'); // 성공 시 메인 페이지로 리디렉트
  } catch (err) {
    console.error(err);
    res.render('purchase_request', { teamId, error: '구매 요청 중 오류가 발생했습니다.' });
  }
};
