def skill_id(conn, skill_name: str) -> int:
    row = conn.execute("SELECT id FROM skills WHERE name = %s", (skill_name,)).fetchone()
    if not row:
        raise ValueError(f"unknown skill {skill_name!r}")
    return int(row["id"])


def upsert_user_skill_score(conn, user_id: int, skill_name: str, score_1_to_3: int) -> None:
    sid = max(1, min(3, int(score_1_to_3)))
    sk = skill_id(conn, skill_name)
    row = conn.execute(
        "SELECT id FROM user_skills WHERE user_id = %s AND skill_id = %s",
        (user_id, sk),
    ).fetchone()
    if row:
        conn.execute(
            "UPDATE user_skills SET score_id = %s WHERE user_id = %s AND skill_id = %s",
            (sid, user_id, sk),
        )
    else:
        conn.execute(
            "INSERT INTO user_skills (user_id, skill_id, score_id) VALUES (%s, %s, %s)",
            (user_id, sk, sid),
        )


def status_id_by_name(conn, name: str) -> int:
    row = conn.execute(
        "SELECT id FROM status WHERE lower(trim(name)) = lower(trim(%s)) LIMIT 1",
        (name,),
    ).fetchone()
    if not row:
        raise ValueError(f"unknown status {name!r}")
    return int(row["id"])
