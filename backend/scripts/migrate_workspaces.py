import sys
import os

# Add the app directory to the path so we can import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.core.database import SessionLocal, engine

def migrate():
    with engine.begin() as conn:
        print("Checking if 'created_by' column exists...")
        # A simple try-except around adding the column
        try:
            conn.execute(text("ALTER TABLE workspaces ADD COLUMN created_by INTEGER REFERENCES users(id)"))
            print("Successfully added 'created_by' column.")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column 'created_by' already exists.")
            else:
                print(f"Error adding column (might be SQLite syntax): {e}")
                # Fallback for SQLite which doesn't support adding FK constraints in ALTER TABLE easily,
                # but it does support adding a simple INTEGER column.
                try:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN created_by INTEGER"))
                    print("Successfully added 'created_by' column (without strict FK constraint).")
                except Exception as e2:
                    print(f"Fallback failed: {e2}")

    # Now, let's backfill existing workspaces.
    db = SessionLocal()
    try:
        # Find all workspaces that don't have a created_by
        from app.models.workspace import Workspace
        from app.models.workspace_member import WorkspaceMember
        from app.models.user import User
        
        workspaces = db.query(Workspace).filter(Workspace.created_by == None).all()
        if not workspaces:
            print("No workspaces need backfilling.")
            return

        for ws in workspaces:
            # Assign ownership to the earliest member of this workspace
            first_member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws.id).order_by(WorkspaceMember.joined_at.asc()).first()
            if first_member:
                ws.created_by = first_member.user_id
                print(f"Workspace {ws.id} assigned to user {first_member.user_id}")
            else:
                print(f"Workspace {ws.id} has no members! Cannot assign owner.")
        
        db.commit()
        print("Migration complete.")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
