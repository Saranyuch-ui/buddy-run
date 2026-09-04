export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/register" && request.method === "POST") {
      return handleRegister(request, env);
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/events" && request.method === "GET") {
      return handleGetEvents(env);
    }

    if (url.pathname === "/api/admin/events" && request.method === "POST") {
      return handleCreateEvent(request, env);
    }

    if (url.pathname === "/api/admin/events" && request.method === "DELETE") {
      return handleDeleteEvent(request, env);
    }

    if (url.pathname === "/api/admin/events" && request.method === "PUT") {
      return handleUpdateEvent(request, env);
    }

    if (url.pathname === "/api/registrations" && request.method === "POST") {
      return handleCreateRegistration(request, env);
    }

    if (url.pathname === "/api/registrations" && request.method === "GET") {
      return handleGetRegistrations(request, env);
    }

    if (url.pathname === "/api/registrations/pay" && request.method === "POST") {
      return handlePayRegistration(request, env);
    }

    if (url.pathname === "/api/registrations/result" && request.method === "POST") {
      return handleSubmitResult(request, env);
    }

    if (url.pathname === "/api/users" && request.method === "GET") {
      return handleGetUser(request, env);
    }

    if (url.pathname === "/api/users" && request.method === "PUT") {
      return handleUpdateUser(request, env);
    }

    if (url.pathname === "/api/admin/pending" && request.method === "GET") {
      return handleGetPendingRegistrations(request, env);
    }

    if (url.pathname === "/api/admin/review" && request.method === "POST") {
      return handleReviewRegistration(request, env);
    }

    if (url.pathname === "/api/admin/dashboard" && request.method === "GET") {
      return handleGetDashboard(request, env);
    }

    if (url.pathname === "/api/admin/members" && request.method === "GET") {
      return handleGetMembers(request, env);
    }

    if (url.pathname === "/api/products" && request.method === "GET") {
      return handleGetProducts(env);
    }

    if (url.pathname === "/api/admin/products" && request.method === "POST") {
      return handleCreateProduct(request, env);
    }

    if (url.pathname === "/api/admin/products" && request.method === "DELETE") {
      return handleDeleteProduct(request, env);
    }

    if (url.pathname === "/api/admin/products" && request.method === "PUT") {
      return handleUpdateProduct(request, env);
    }

    if (url.pathname === "/api/admin/categories" && request.method === "GET") {
      return handleGetCategories(request, env);
    }

    if (url.pathname === "/api/admin/categories" && request.method === "POST") {
      return handleCreateCategory(request, env);
    }

    if (url.pathname === "/api/admin/categories" && request.method === "DELETE") {
      return handleDeleteCategory(request, env);
    }

    if (url.pathname === "/api/orders" && request.method === "POST") {
      return handleCreateOrder(request, env);
    }

    if (url.pathname === "/api/orders" && request.method === "GET") {
      return handleGetUserOrders(request, env);
    }

    if (url.pathname === "/api/orders" && request.method === "DELETE") {
      return handleCancelOrder(request, env);
    }

    if (url.pathname === "/api/cart" && request.method === "GET") {
      return handleGetCart(request, env);
    }

    if (url.pathname === "/api/cart" && request.method === "POST") {
      return handleAddToCart(request, env);
    }

    if (url.pathname === "/api/cart" && request.method === "DELETE") {
      return handleRemoveFromCart(request, env);
    }

    if (url.pathname === "/api/cart/checkout" && request.method === "POST") {
      return handleCheckoutCart(request, env);
    }

    if (url.pathname === "/api/orders/pay" && request.method === "POST") {
      return handlePayOrder(request, env);
    }

    if (url.pathname === "/api/orders/pay-all" && request.method === "POST") {
      return handlePayAllOrders(request, env);
    }

    if (url.pathname === "/api/orders/cancel-all" && request.method === "POST") {
      return handleCancelAllOrders(request, env);
    }

    if (url.pathname === "/api/admin/shop-pending" && request.method === "GET") {
      return handleGetPendingOrders(request, env);
    }

    if (url.pathname === "/api/admin/review-order" && request.method === "POST") {
      return handleReviewOrder(request, env);
    }

    if (url.pathname === "/api/nav-counts" && request.method === "GET") {
      return handleGetNavCounts(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isAdmin(env, userId) {
  const user = await env.DB.prepare("SELECT is_admin FROM users WHERE id = ?")
    .bind(userId)
    .first();
  return !!(user && user.is_admin === 1);
}

async function fileToBase64DataUrl(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:${file.type};base64,${base64}`;
}

async function handleRegister(request, env) {
  const body = await request.json();
  const passwordHash = await hashPassword(body.password);

  const existing = await env.DB.prepare(
    "SELECT id FROM users WHERE username = ?"
  )
    .bind(body.username)
    .first();

  if (existing) {
    return Response.json(
      { success: false, error: "User ID นี้ถูกใช้งานแล้ว" },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO users
        (username, email, password_hash, first_name, last_name, birthdate, gender, shirt_size,
         house_no, moo, soi, road, sub_district, district, province, postal_code, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.username,
        body.email,
        passwordHash,
        body.firstName,
        body.lastName,
        body.birthdate,
        body.gender,
        body.shirtSize,
        body.houseNo,
        body.moo,
        body.soi,
        body.road,
        body.subDistrict,
        body.district,
        body.province,
        body.postalCode,
        body.phone
      )
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
      { status: 400 }
    );
  }
}

async function handleLogin(request, env) {
  const body = await request.json();
  const passwordHash = await hashPassword(body.password);

  const user = await env.DB.prepare(
    "SELECT id, email, first_name, is_admin FROM users WHERE username = ? AND password_hash = ?"
  )
    .bind(body.username, passwordHash)
    .first();

  if (!user) {
    return Response.json(
      { success: false, error: "User ID หรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  return Response.json({ success: true, user });
}

async function handleGetEvents(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, title, location, distance, image, description,
            reg_start_date, reg_end_date, result_start_date, result_end_date, shipping_date
     FROM events ORDER BY reg_start_date ASC`
  ).all();

  return Response.json({ success: true, events: results });
}

async function handleCreateEvent(request, env) {
  const formData = await request.formData();
  const adminUserId = formData.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const title = formData.get("title");
  const challenge = formData.get("challenge");
  const location = formData.get("location");
  const distance = formData.get("distance");
  const regStartDate = formData.get("regStartDate");
  const regEndDate = formData.get("regEndDate");
  const resultStartDate = formData.get("resultStartDate");
  const resultEndDate = formData.get("resultEndDate");
  const shippingDate = formData.get("shippingDate");
  const file = formData.get("image");

  if (
    !title ||
    !challenge ||
    !location ||
    !distance ||
    !regStartDate ||
    !regEndDate ||
    !resultStartDate ||
    !resultEndDate ||
    !file
  ) {
    return Response.json(
      { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const imageDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      `INSERT INTO events
        (title, event_date, end_date, location, distance, image, description,
         reg_start_date, reg_end_date, result_start_date, result_end_date, shipping_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        title,
        regStartDate,
        resultEndDate,
        location,
        distance,
        imageDataUrl,
        challenge,
        regStartDate,
        regEndDate,
        resultStartDate,
        resultEndDate,
        shippingDate || null
      )
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "เพิ่มกิจกรรมไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleDeleteEvent(request, env) {
  const body = await request.json();
  const { adminUserId, eventId } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  if (!eventId) {
    return Response.json({ success: false, error: "ไม่พบ eventId" }, { status: 400 });
  }

  try {
    await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(eventId).run();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ลบกิจกรรมไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleCreateRegistration(request, env) {
  const body = await request.json();

  if (!body.userId || !body.eventId || !body.packageId) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO registrations
        (user_id, event_id, package_id, event_title, package_name, price, status, event_end_date, reg_end_date)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`
    )
      .bind(
        body.userId,
        body.eventId,
        body.packageId,
        body.eventTitle,
        body.packageName,
        body.price,
        body.eventEndDate || null,
        body.regEndDate || null
      )
      .run();

    // ส่งอีเมลแจ้งเตือน - ไม่ให้ล้มเหลวตรงนี้กระทบผลลัพธ์การลงทะเบียน
    if (body.userEmail) {
      try {
        await sendRegistrationEmail(env, body.userEmail, body.eventTitle, body.packageName, body.price);
      } catch (emailErr) {
        console.log("ส่งอีเมลไม่สำเร็จ:", emailErr);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.log("ลงทะเบียนล้มเหลว:", err.message || err);
    return Response.json(
      { success: false, error: "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function sendEmail(env, toEmail, subject, bodyHtml) {
  if (!env.RESEND_API_KEY) {
    console.log("ไม่ได้ส่งอีเมล: ไม่พบ secret RESEND_API_KEY (ตั้งค่าด้วย `wrangler secret put RESEND_API_KEY`)");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Buddy Run <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🏃 Buddy Run</h2>
          ${bodyHtml}
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log(`ส่งอีเมลไม่สำเร็จ (Resend ตอบ ${res.status}): ${errText}`);
  }
}

async function sendRegistrationEmail(env, toEmail, eventTitle, packageName, price) {
  await sendEmail(
    env,
    toEmail,
    `ลงทะเบียนสำเร็จ - ${eventTitle}`,
    `
      <p>ลงทะเบียนกิจกรรมสำเร็จแล้ว!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px 0; color: #6b7280;">กิจกรรม</td><td style="padding: 8px 0; font-weight: bold;">${eventTitle}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">แพ็กเกจ</td><td style="padding: 8px 0; font-weight: bold;">${packageName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">ราคา</td><td style="padding: 8px 0; font-weight: bold;">${price.toLocaleString()} บาท</td></tr>
      </table>
      <p style="margin-top: 20px; color: #6b7280; font-size: 0.9rem;">
        กรุณาชำระเงินภายในระยะเวลาที่กำหนด โดยเข้าไปที่หน้า "ชำระเงิน" บนเว็บไซต์
      </p>
    `
  );
}

async function sendPaymentApprovedEmail(env, toEmail, eventTitle, packageName, price) {
  await sendEmail(
    env,
    toEmail,
    `ยืนยันการชำระเงินสำเร็จ - ${eventTitle}`,
    `
      <p>✅ การชำระเงินของคุณได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px 0; color: #6b7280;">กิจกรรม</td><td style="padding: 8px 0; font-weight: bold;">${eventTitle}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">แพ็กเกจ</td><td style="padding: 8px 0; font-weight: bold;">${packageName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">ยอดที่ชำระ</td><td style="padding: 8px 0; font-weight: bold;">${price.toLocaleString()} บาท</td></tr>
      </table>
      <p style="margin-top: 20px; color: #6b7280; font-size: 0.9rem;">
        เมื่อถึงวันเริ่มส่งผลกิจกรรม กรุณาเข้าไปที่หน้า "ส่งผลกิจกรรม" บนเว็บไซต์เพื่อส่งหลักฐานผลการวิ่ง
      </p>
    `
  );
}

async function sendResultApprovedEmail(env, toEmail, eventTitle, packageName, shippingDate) {
  await sendEmail(
    env,
    toEmail,
    `อนุมัติผลกิจกรรมเรียบร้อยแล้ว - ${eventTitle}`,
    `
      <p>🎉 ผลการวิ่งของคุณได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px 0; color: #6b7280;">กิจกรรม</td><td style="padding: 8px 0; font-weight: bold;">${eventTitle}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">แพ็กเกจ</td><td style="padding: 8px 0; font-weight: bold;">${packageName}</td></tr>
      </table>
      ${
        shippingDate
          ? `<p style="margin-top: 15px;">🎁 ของรางวัล จะจัดส่งให้ตามที่อยู่ ในวันที่ ${shippingDate.slice(0, 10)}</p>`
          : ""
      }
      <p style="margin-top: 20px; color: #6b7280; font-size: 0.9rem;">
        ขอบคุณที่เข้าร่วมกิจกรรมกับ Buddy Run! 🏃
      </p>
    `
  );
}

async function handleGetRegistrations(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const { results } = await env.DB.prepare(
    `SELECT r.id, r.user_id, r.event_id, r.package_id, r.status, r.created_at, r.event_title,
            r.package_name, r.price, r.paid_amount, r.slip_image, r.result_image,
            r.event_end_date, r.reg_end_date, e.result_start_date, e.result_end_date
     FROM registrations r
     LEFT JOIN events e ON r.event_id = e.id
     WHERE r.user_id = ? ORDER BY r.created_at DESC`
  )
    .bind(userId)
    .all();

  return Response.json({ success: true, registrations: results });
}

async function handlePayRegistration(request, env) {
  const formData = await request.formData();

  const registrationId = formData.get("registrationId");
  const amount = Number(formData.get("amount"));
  const file = formData.get("slip");
  const verifiedByOcr = formData.get("verifiedByOcr") === "true";

  if (!registrationId || !amount || !file) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปและกรอกยอดเงิน" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const reg = await env.DB.prepare(
    "SELECT * FROM registrations WHERE id = ?"
  )
    .bind(registrationId)
    .first();

  if (!reg) {
    return Response.json(
      { success: false, error: "ไม่พบรายการลงทะเบียนนี้" },
      { status: 404 }
    );
  }

  if (reg.status === "paid") {
    return Response.json(
      { success: false, error: "รายการนี้ชำระเงินแล้ว" },
      { status: 400 }
    );
  }

  if (amount < reg.price) {
    return Response.json(
      { success: false, error: `ยอดชำระต้องไม่ต่ำกว่า ${reg.price.toLocaleString()} บาท` },
      { status: 400 }
    );
  }

  const newStatus = verifiedByOcr ? "pending_ocr_approval" : "pending_verification";
  const slipDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      "UPDATE registrations SET status = ?, paid_amount = ?, slip_image = ? WHERE id = ?"
    )
      .bind(newStatus, amount, slipDataUrl, registrationId)
      .run();

    return Response.json({ success: true, status: newStatus });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleSubmitResult(request, env) {
  const formData = await request.formData();

  const registrationId = formData.get("registrationId");
  const userId = formData.get("userId");
  const file = formData.get("resultImage");

  if (!registrationId || !userId || !file) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน กรุณาแนบรูปผลกิจกรรม" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const reg = await env.DB.prepare(
    "SELECT * FROM registrations WHERE id = ?"
  )
    .bind(registrationId)
    .first();

  if (!reg) {
    return Response.json(
      { success: false, error: "ไม่พบรายการลงทะเบียนนี้" },
      { status: 404 }
    );
  }

  if (String(reg.user_id) !== String(userId)) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์ทำรายการนี้" },
      { status: 403 }
    );
  }

  if (reg.status !== "paid") {
    return Response.json(
      { success: false, error: "กิจกรรมนี้ยังไม่พร้อมให้ส่งผล" },
      { status: 400 }
    );
  }

  const event = await env.DB.prepare(
    "SELECT result_start_date, result_end_date FROM events WHERE id = ?"
  )
    .bind(reg.event_id)
    .first();

  const todayStr = new Date().toISOString().slice(0, 10);
  if (event?.result_start_date && todayStr < event.result_start_date.slice(0, 10)) {
    return Response.json(
      { success: false, error: "ยังไม่ถึงวันเริ่มส่งผลกิจกรรม" },
      { status: 400 }
    );
  }
  if (event?.result_end_date && todayStr > event.result_end_date.slice(0, 10)) {
    return Response.json(
      { success: false, error: "หมดเวลาส่งผลกิจกรรมแล้ว" },
      { status: 400 }
    );
  }

  const resultDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      "UPDATE registrations SET status = 'result_pending', result_image = ? WHERE id = ?"
    )
      .bind(resultDataUrl, registrationId)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ส่งผลกิจกรรมไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetUser(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const user = await env.DB.prepare(
    `SELECT id, username, email, first_name, last_name, birthdate, gender, shirt_size,
            house_no, moo, soi, road, sub_district, district, province, postal_code, phone, is_admin
     FROM users WHERE id = ?`
  )
    .bind(userId)
    .first();

  if (!user) {
    return Response.json({ success: false, error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  return Response.json({ success: true, user });
}

async function handleUpdateUser(request, env) {
  const body = await request.json();

  if (!body.userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  try {
    await env.DB.prepare(
      `UPDATE users SET
        first_name = ?, last_name = ?, birthdate = ?, gender = ?, shirt_size = ?,
        house_no = ?, moo = ?, soi = ?, road = ?, sub_district = ?, district = ?,
        province = ?, postal_code = ?, phone = ?
       WHERE id = ?`
    )
      .bind(
        body.firstName,
        body.lastName,
        body.birthdate,
        body.gender,
        body.shirtSize,
        body.houseNo,
        body.moo,
        body.soi,
        body.road,
        body.subDistrict,
        body.district,
        body.province,
        body.postalCode,
        body.phone,
        body.userId
      )
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "แก้ไขข้อมูลไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetPendingRegistrations(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const { results } = await env.DB.prepare(
    `SELECT r.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     WHERE r.status IN ('pending_verification', 'pending_ocr_approval', 'result_pending')
     ORDER BY r.created_at ASC`
  ).all();

  return Response.json({ success: true, registrations: results });
}

async function handleReviewRegistration(request, env) {
  const body = await request.json();
  const { adminUserId, registrationId, action } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  if (!registrationId || !["approve", "reject"].includes(action)) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  const reg = await env.DB.prepare("SELECT * FROM registrations WHERE id = ?")
    .bind(registrationId)
    .first();

  if (!reg) {
    return Response.json(
      { success: false, error: "ไม่พบรายการลงทะเบียนนี้" },
      { status: 404 }
    );
  }

  try {
    if (reg.status === "pending_verification" || reg.status === "pending_ocr_approval") {
      await env.DB.prepare(
        "INSERT INTO admin_reviews (registration_id, review_type, action) VALUES (?, 'payment', ?)"
      )
        .bind(registrationId, action)
        .run();

      if (action === "approve") {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'paid', slip_image = NULL, paid_at = datetime('now') WHERE id = ?"
        )
          .bind(registrationId)
          .run();

        const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
          .bind(reg.user_id)
          .first();
        if (user?.email) {
          try {
            await sendPaymentApprovedEmail(
              env,
              user.email,
              reg.event_title,
              reg.package_name,
              reg.paid_amount ?? reg.price
            );
          } catch (emailErr) {
            console.log("ส่งอีเมลไม่สำเร็จ:", emailErr);
          }
        }
      } else {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'confirmed' WHERE id = ?"
        )
          .bind(registrationId)
          .run();
      }
    } else if (reg.status === "result_pending") {
      await env.DB.prepare(
        "INSERT INTO admin_reviews (registration_id, review_type, action) VALUES (?, 'result', ?)"
      )
        .bind(registrationId, action)
        .run();

      if (action === "approve") {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'completed', result_image = NULL WHERE id = ?"
        )
          .bind(registrationId)
          .run();

        const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
          .bind(reg.user_id)
          .first();
        const event = await env.DB.prepare("SELECT shipping_date FROM events WHERE id = ?")
          .bind(reg.event_id)
          .first();
        if (user?.email) {
          try {
            await sendResultApprovedEmail(
              env,
              user.email,
              reg.event_title,
              reg.package_name,
              event?.shipping_date
            );
          } catch (emailErr) {
            console.log("ส่งอีเมลไม่สำเร็จ:", emailErr);
          }
        }
      } else {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'paid' WHERE id = ?"
        )
          .bind(registrationId)
          .run();
      }
    } else {
      return Response.json(
        { success: false, error: "รายการนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ" },
        { status: 400 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetDashboard(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");
  const period = url.searchParams.get("period") || "month";
  const periodShop = url.searchParams.get("periodShop") || "month";

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const totalMembers = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first();

  const activeEventsCount = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM events WHERE reg_start_date <= date('now') AND result_end_date >= date('now')"
  ).first();

  const todaySignups = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE date(created_at) = date('now')"
  ).first();

  const revenueQuery =
    period === "today"
      ? "SELECT COALESCE(SUM(paid_amount),0) AS s FROM registrations WHERE paid_at IS NOT NULL AND date(paid_at) = date('now')"
      : "SELECT COALESCE(SUM(paid_amount),0) AS s FROM registrations WHERE paid_at IS NOT NULL AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')";
  const revenue = await env.DB.prepare(revenueQuery).first();

  const shopRevenueQuery =
    periodShop === "today"
      ? "SELECT COALESCE(SUM(paid_amount),0) AS s FROM orders WHERE paid_at IS NOT NULL AND date(paid_at) = date('now')"
      : "SELECT COALESCE(SUM(paid_amount),0) AS s FROM orders WHERE paid_at IS NOT NULL AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')";
  const shopRevenue = await env.DB.prepare(shopRevenueQuery).first();

  const pendingPayment = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE status = 'confirmed'"
  ).first();

  const pendingSlip = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE status IN ('pending_verification', 'pending_ocr_approval')"
  ).first();

  const pendingShopSlip = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM orders WHERE status IN ('pending_verification', 'pending_ocr_approval')"
  ).first();

  const pendingResult = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE status = 'result_pending'"
  ).first();

  const { results: weeklySignupsRaw } = await env.DB.prepare(
    `SELECT date(created_at) AS d, COUNT(*) AS c
     FROM registrations
     WHERE date(created_at) >= date('now', '-6 days')
     GROUP BY d
     ORDER BY d ASC`
  ).all();

  const { results: monthlyRevenueEventRaw } = await env.DB.prepare(
    `SELECT strftime('%m', paid_at) AS m, SUM(paid_amount) AS s
     FROM registrations
     WHERE paid_at IS NOT NULL AND strftime('%Y', paid_at) = strftime('%Y', 'now')
     GROUP BY m
     ORDER BY m ASC`
  ).all();

  const { results: monthlyRevenueShopRaw } = await env.DB.prepare(
    `SELECT strftime('%m', paid_at) AS m, SUM(paid_amount) AS s
     FROM orders
     WHERE paid_at IS NOT NULL AND strftime('%Y', paid_at) = strftime('%Y', 'now')
     GROUP BY m
     ORDER BY m ASC`
  ).all();

  const monthlyRevenueMap = {};
  monthlyRevenueEventRaw.forEach((row) => {
    monthlyRevenueMap[row.m] = (monthlyRevenueMap[row.m] || 0) + (row.s || 0);
  });
  monthlyRevenueShopRaw.forEach((row) => {
    monthlyRevenueMap[row.m] = (monthlyRevenueMap[row.m] || 0) + (row.s || 0);
  });
  const monthlyRevenueRaw = Object.keys(monthlyRevenueMap)
    .sort()
    .map((m) => ({ m, s: monthlyRevenueMap[m] }));

  const newMembersToday = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE date(created_at) = date('now')"
  ).first();

  const newMembersWeek = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE date(created_at) >= date('now', '-6 days')"
  ).first();

  const newMembersMonth = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
  ).first();

  const { results: activeEventsList } = await env.DB.prepare(
    `SELECT
       e.id, e.title,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS signups,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('paid','result_pending','completed')) AS paid,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('result_pending','completed')) AS result
     FROM events e
     WHERE e.reg_start_date <= date('now') AND e.result_end_date >= date('now')
     ORDER BY e.reg_start_date ASC`
  ).all();

  return Response.json({
    success: true,
    totalMembers: totalMembers.c,
    activeEvents: activeEventsCount.c,
    todaySignups: todaySignups.c,
    revenue: revenue.s,
    revenuePeriod: period,
    shopRevenue: shopRevenue.s,
    shopRevenuePeriod: periodShop,
    pendingPayment: pendingPayment.c,
    pendingSlip: pendingSlip.c,
    pendingShopSlip: pendingShopSlip.c,
    pendingResult: pendingResult.c,
    weeklySignups: weeklySignupsRaw,
    monthlyRevenue: monthlyRevenueRaw,
    newMembers: {
      today: newMembersToday.c,
      week: newMembersWeek.c,
      month: newMembersMonth.c,
    },
    activeEventsList,
  });
}

async function handleGetMembers(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const { results } = await env.DB.prepare(
    `SELECT id, username, email, first_name, last_name, phone, is_admin, created_at
     FROM users
     ORDER BY created_at DESC`
  ).all();

  return Response.json({ success: true, members: results });
}

async function handleGetProducts(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, price, description, image, category, sizes FROM products ORDER BY created_at DESC"
  ).all();

  return Response.json({ success: true, products: results });
}

async function handleGetCategories(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const { results } = await env.DB.prepare(
    "SELECT id, name FROM categories ORDER BY name ASC"
  ).all();

  return Response.json({ success: true, categories: results });
}

async function handleCreateCategory(request, env) {
  const body = await request.json();
  const { adminUserId, name } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    return Response.json(
      { success: false, error: "กรุณากรอกชื่อหมวดหมู่" },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare("INSERT INTO categories (name) VALUES (?)")
      .bind(trimmedName)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "หมวดหมู่นี้มีอยู่แล้ว หรือเพิ่มไม่สำเร็จ" },
      { status: 400 }
    );
  }
}

async function handleDeleteCategory(request, env) {
  const body = await request.json();
  const { adminUserId, categoryId } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  if (!categoryId) {
    return Response.json({ success: false, error: "ไม่พบ categoryId" }, { status: 400 });
  }

  try {
    await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(categoryId).run();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ลบหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleCreateOrder(request, env) {
  const body = await request.json();
  const { userId, productId, quantity, size } = body;

  if (!userId || !productId || !quantity || quantity < 1 || !size) {
    return Response.json(
      { success: false, error: "กรุณาเลือกไซส์และจำนวนสินค้าให้ครบ" },
      { status: 400 }
    );
  }

  const product = await env.DB.prepare(
    "SELECT id, name, price FROM products WHERE id = ?"
  )
    .bind(productId)
    .first();

  if (!product) {
    return Response.json(
      { success: false, error: "ไม่พบสินค้านี้" },
      { status: 404 }
    );
  }

  const total = product.price * quantity;

  try {
    await env.DB.prepare(
      `INSERT INTO orders (user_id, product_id, product_name, price, quantity, total, status, size)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
    )
      .bind(userId, product.id, product.name, product.price, quantity, total, size)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "สั่งซื้อไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetUserOrders(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const { results } = await env.DB.prepare(
    "SELECT id, user_id, product_id, product_name, price, quantity, total, status, paid_amount, slip_image, size, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(userId)
    .all();

  return Response.json({ success: true, orders: results });
}

async function handlePayOrder(request, env) {
  const formData = await request.formData();

  const orderId = formData.get("orderId");
  const amount = Number(formData.get("amount"));
  const file = formData.get("slip");
  const verifiedByOcr = formData.get("verifiedByOcr") === "true";

  if (!orderId || !amount || !file) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปและกรอกยอดเงิน" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(orderId)
    .first();

  if (!order) {
    return Response.json(
      { success: false, error: "ไม่พบคำสั่งซื้อนี้" },
      { status: 404 }
    );
  }

  if (order.status === "paid") {
    return Response.json(
      { success: false, error: "คำสั่งซื้อนี้ชำระเงินแล้ว" },
      { status: 400 }
    );
  }

  if (amount < order.total) {
    return Response.json(
      { success: false, error: `ยอดชำระต้องไม่ต่ำกว่า ${order.total.toLocaleString()} บาท` },
      { status: 400 }
    );
  }

  const newStatus = verifiedByOcr ? "pending_ocr_approval" : "pending_verification";
  const slipDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      "UPDATE orders SET status = ?, paid_amount = ?, slip_image = ? WHERE id = ?"
    )
      .bind(newStatus, amount, slipDataUrl, orderId)
      .run();

    return Response.json({ success: true, status: newStatus });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetPendingOrders(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const { results } = await env.DB.prepare(
    `SELECT o.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.status IN ('pending_verification', 'pending_ocr_approval')
     ORDER BY o.created_at ASC`
  ).all();

  return Response.json({ success: true, orders: results });
}

async function handleReviewOrder(request, env) {
  const body = await request.json();
  const { adminUserId, orderId, action } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  if (!orderId || !["approve", "reject"].includes(action)) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  try {
    if (action === "approve") {
      await env.DB.prepare(
        "UPDATE orders SET status = 'paid', slip_image = NULL, paid_at = datetime('now') WHERE id = ?"
      )
        .bind(orderId)
        .run();
    } else {
      await env.DB.prepare(
        "UPDATE orders SET status = 'pending' WHERE id = ?"
      )
        .bind(orderId)
        .run();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleCancelOrder(request, env) {
  const body = await request.json();
  const { userId, orderId } = body;

  if (!userId || !orderId) {
    return Response.json({ success: false, error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(orderId)
    .first();

  if (!order) {
    return Response.json({ success: false, error: "ไม่พบคำสั่งซื้อนี้" }, { status: 404 });
  }

  if (String(order.user_id) !== String(userId)) {
    return Response.json({ success: false, error: "ไม่มีสิทธิ์ทำรายการนี้" }, { status: 403 });
  }

  if (order.status !== "pending") {
    return Response.json(
      { success: false, error: "ไม่สามารถยกเลิกคำสั่งซื้อนี้ได้แล้ว" },
      { status: 400 }
    );
  }

  try {
    // ยกเลิกแล้ว -> ย้ายรายการกลับไปที่ตะกร้าแทนการลบทิ้ง
    await env.DB.prepare(
      `INSERT INTO cart_items (user_id, product_id, product_name, price, size, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(order.user_id, order.product_id, order.product_name, order.price, order.size, order.quantity)
      .run();

    await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ยกเลิกคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetCart(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(userId)
    .all();

  return Response.json({ success: true, cartItems: results });
}

async function handleAddToCart(request, env) {
  const body = await request.json();
  const { userId, productId, quantity, size } = body;

  if (!userId || !productId || !quantity || quantity < 1 || !size) {
    return Response.json(
      { success: false, error: "กรุณาเลือกไซส์และจำนวนสินค้าให้ครบ" },
      { status: 400 }
    );
  }

  const product = await env.DB.prepare(
    "SELECT id, name, price FROM products WHERE id = ?"
  )
    .bind(productId)
    .first();

  if (!product) {
    return Response.json({ success: false, error: "ไม่พบสินค้านี้" }, { status: 404 });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO cart_items (user_id, product_id, product_name, price, size, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, product.id, product.name, product.price, size, quantity)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "เพิ่มสินค้าลงตะกร้าไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleRemoveFromCart(request, env) {
  const body = await request.json();
  const { userId, cartItemId } = body;

  if (!userId || !cartItemId) {
    return Response.json({ success: false, error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  const item = await env.DB.prepare("SELECT * FROM cart_items WHERE id = ?")
    .bind(cartItemId)
    .first();

  if (!item || String(item.user_id) !== String(userId)) {
    return Response.json({ success: false, error: "ไม่มีสิทธิ์ทำรายการนี้" }, { status: 403 });
  }

  try {
    await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(cartItemId).run();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ลบสินค้าออกจากตะกร้าไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCart(request, env) {
  const body = await request.json();
  const { userId, cartItemIds } = body;

  if (!userId || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    return Response.json(
      { success: false, error: "กรุณาเลือกรายการที่ต้องการชำระ" },
      { status: 400 }
    );
  }

  const placeholders = cartItemIds.map(() => "?").join(",");
  const { results: items } = await env.DB.prepare(
    `SELECT * FROM cart_items WHERE user_id = ? AND id IN (${placeholders})`
  )
    .bind(userId, ...cartItemIds)
    .all();

  if (!items || items.length === 0) {
    return Response.json({ success: false, error: "ไม่พบรายการที่เลือก" }, { status: 400 });
  }

  try {
    for (const item of items) {
      const total = item.price * item.quantity;
      await env.DB.prepare(
        `INSERT INTO orders (user_id, product_id, product_name, price, quantity, total, status, size)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
        .bind(userId, item.product_id, item.product_name, item.price, item.quantity, total, item.size)
        .run();

      await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(item.id).run();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ดำเนินการชำระเงินไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetNavCounts(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const unpaidCount = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM registrations
     WHERE user_id = ? AND status = 'confirmed'
     AND (reg_end_date IS NULL OR reg_end_date >= date('now'))`
  )
    .bind(userId)
    .first();
  const resultPendingCount = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE user_id = ? AND status = 'paid'"
  )
    .bind(userId)
    .first();

  const cartCount = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM cart_items WHERE user_id = ?"
  )
    .bind(userId)
    .first();

  return Response.json({
    success: true,
    unpaid: unpaidCount.c,
    resultPending: resultPendingCount.c,
    cart: cartCount.c,
  });
}

async function handlePayAllOrders(request, env) {
  const formData = await request.formData();

  const userId = formData.get("userId");
  const amount = Number(formData.get("amount"));
  const file = formData.get("slip");
  const verifiedByOcr = formData.get("verifiedByOcr") === "true";

  if (!userId || !amount || !file) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปและกรอกยอดเงิน" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const { results: orders } = await env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? AND status = 'pending'"
  )
    .bind(userId)
    .all();

  if (!orders || orders.length === 0) {
    return Response.json(
      { success: false, error: "ไม่มีคำสั่งซื้อที่รอชำระเงิน" },
      { status: 400 }
    );
  }

  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);

  if (amount < grandTotal) {
    return Response.json(
      { success: false, error: `ยอดชำระต้องไม่ต่ำกว่า ${grandTotal.toLocaleString()} บาท` },
      { status: 400 }
    );
  }

  const newStatus = verifiedByOcr ? "pending_ocr_approval" : "pending_verification";
  const slipDataUrl = await fileToBase64DataUrl(file);

  try {
    for (const order of orders) {
      await env.DB.prepare(
        "UPDATE orders SET status = ?, paid_amount = ?, slip_image = ? WHERE id = ?"
      )
        .bind(newStatus, order.total, slipDataUrl, order.id)
        .run();
    }

    return Response.json({ success: true, status: newStatus });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleCancelAllOrders(request, env) {
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const { results: orders } = await env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? AND status = 'pending'"
  )
    .bind(userId)
    .all();

  if (!orders || orders.length === 0) {
    return Response.json({ success: false, error: "ไม่มีคำสั่งซื้อที่รอชำระเงิน" }, { status: 400 });
  }

  try {
    for (const order of orders) {
      await env.DB.prepare(
        `INSERT INTO cart_items (user_id, product_id, product_name, price, size, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(order.user_id, order.product_id, order.product_name, order.price, order.size, order.quantity)
        .run();

      await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(order.id).run();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ยกเลิกคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleCreateProduct(request, env) {
  const formData = await request.formData();
  const adminUserId = formData.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const name = formData.get("name");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const sizes = formData.get("sizes");
  const file = formData.get("image");

  if (!name || !price || price <= 0 || !category || !file) {
    return Response.json(
      { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const imageDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      "INSERT INTO products (name, price, description, image, category, sizes) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(name, price, description, imageDataUrl, category, sizes)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "เพิ่มสินค้าไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleDeleteProduct(request, env) {
  const body = await request.json();
  const { adminUserId, productId } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  if (!productId) {
    return Response.json({ success: false, error: "ไม่พบ productId" }, { status: 400 });
  }

  try {
    await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ลบสินค้าไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleUpdateEvent(request, env) {
  const formData = await request.formData();
  const adminUserId = formData.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const eventId = formData.get("eventId");
  const title = formData.get("title");
  const challenge = formData.get("challenge");
  const location = formData.get("location");
  const distance = formData.get("distance");
  const regStartDate = formData.get("regStartDate");
  const regEndDate = formData.get("regEndDate");
  const resultStartDate = formData.get("resultStartDate");
  const resultEndDate = formData.get("resultEndDate");
  const shippingDate = formData.get("shippingDate");
  const file = formData.get("image");

  if (
    !eventId ||
    !title ||
    !challenge ||
    !location ||
    !distance ||
    !regStartDate ||
    !regEndDate ||
    !resultStartDate ||
    !resultEndDate
  ) {
    return Response.json(
      { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  }

  let imageDataUrl = null;

  if (file && file.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
        { status: 400 }
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
        { status: 400 }
      );
    }
    imageDataUrl = await fileToBase64DataUrl(file);
  }

  try {
    if (imageDataUrl) {
      await env.DB.prepare(
        `UPDATE events SET
          title = ?, event_date = ?, end_date = ?, location = ?, distance = ?,
          image = ?, description = ?, reg_start_date = ?, reg_end_date = ?,
          result_start_date = ?, result_end_date = ?, shipping_date = ?
         WHERE id = ?`
      )
        .bind(
          title,
          regStartDate,
          resultEndDate,
          location,
          distance,
          imageDataUrl,
          challenge,
          regStartDate,
          regEndDate,
          resultStartDate,
          resultEndDate,
          shippingDate || null,
          eventId
        )
        .run();
    } else {
      await env.DB.prepare(
        `UPDATE events SET
          title = ?, event_date = ?, end_date = ?, location = ?, distance = ?,
          description = ?, reg_start_date = ?, reg_end_date = ?,
          result_start_date = ?, result_end_date = ?, shipping_date = ?
         WHERE id = ?`
      )
        .bind(
          title,
          regStartDate,
          resultEndDate,
          location,
          distance,
          challenge,
          regStartDate,
          regEndDate,
          resultStartDate,
          resultEndDate,
          shippingDate || null,
          eventId
        )
        .run();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "แก้ไขกิจกรรมไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleUpdateProduct(request, env) {
  const formData = await request.formData();
  const adminUserId = formData.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const productId = formData.get("productId");
  const name = formData.get("name");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const sizes = formData.get("sizes");
  const file = formData.get("image");

  if (!productId || !name || !price || price <= 0 || !category) {
    return Response.json(
      { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  }

  let imageDataUrl = null;

  if (file && file.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
        { status: 400 }
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
        { status: 400 }
      );
    }
    imageDataUrl = await fileToBase64DataUrl(file);
  }

  try {
    if (imageDataUrl) {
      await env.DB.prepare(
        "UPDATE products SET name = ?, price = ?, description = ?, category = ?, sizes = ?, image = ? WHERE id = ?"
      )
        .bind(name, price, description, category, sizes, imageDataUrl, productId)
        .run();
    } else {
      await env.DB.prepare(
        "UPDATE products SET name = ?, price = ?, description = ?, category = ?, sizes = ? WHERE id = ?"
      )
        .bind(name, price, description, category, sizes, productId)
        .run();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "แก้ไขสินค้าไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
