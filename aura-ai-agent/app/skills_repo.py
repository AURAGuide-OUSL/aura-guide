def skill_id(conn, skill_name: str) -> int:
    row = conn.execute(
        "SELECT id FROM skills WHERE name = %s ORDER BY id LIMIT 1",
        (skill_name,),
    ).fetchone()
    if not row:
        raise ValueError(f"unknown skill {skill_name!r}")
    return int(row["id"])


def upsert_user_skill_score(conn, user_id: int, skill_name: str, score_1_to_3: int) -> None:
    """Merge evaluation into user_skills using a running average across attempts."""
    sid = max(1, min(3, int(score_1_to_3)))
    sk = skill_id(conn, skill_name)

    rows = conn.execute(
        "SELECT id, score_id FROM user_skills WHERE user_id = %s AND skill_id = %s",
        (user_id, sk),
    ).fetchall()

    if rows:
        scores = [int(r["score_id"]) for r in rows if r.get("score_id")]
        scores.append(sid)
        avg = round(sum(scores) / len(scores))
        avg = max(1, min(3, avg))
        conn.execute(
            "DELETE FROM user_skills WHERE user_id = %s AND skill_id = %s",
            (user_id, sk),
        )
        conn.execute(
            "INSERT INTO user_skills (user_id, skill_id, score_id) VALUES (%s, %s, %s)",
            (user_id, sk, avg),
        )
    else:
        conn.execute(
            "INSERT INTO user_skills (user_id, skill_id, score_id) VALUES (%s, %s, %s)",
            (user_id, sk, sid),
        )


def status_id_by_name(conn, name: str) -> int:
    row = conn.execute(
        "SELECT id FROM status WHERE lower(trim(name)) = lower(trim(%s)) ORDER BY id LIMIT 1",
        (name,),
    ).fetchone()
    if not row:
        raise ValueError(f"unknown status {name!r}")
    return int(row["id"])
