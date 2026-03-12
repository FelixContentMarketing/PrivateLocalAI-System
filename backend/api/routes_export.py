from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from backend.auth import AuthUser, get_current_user
from backend.services.document_exporter import export_txt, export_docx

router = APIRouter()


class ExportRequest(BaseModel):
    text: str
    format: str  # "docx" or "txt"
    document_type: str  # "zusammenfassung", "besprechungsprotokoll", etc.
    metadata: dict | None = None


@router.post("/export")
async def export_document(
    req: ExportRequest,
    _user: AuthUser = Depends(get_current_user),
):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text darf nicht leer sein")

    format_labels = {
        "zusammenfassung": "Zusammenfassung",
        "besprechungsprotokoll": "Protokoll",
        "schriftsatz_entwurf": "Schriftsatz",
        "mandantenanschreiben": "Anschreiben",
    }
    label = format_labels.get(req.document_type, "Dokument")

    if req.format == "txt":
        content = export_txt(req.text, req.document_type)
        return Response(
            content=content,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="KK_{label}.txt"'},
        )
    elif req.format == "docx":
        content = export_docx(req.text, req.document_type, req.metadata)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="KK_{label}.docx"'},
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unbekanntes Export-Format: {req.format}")
