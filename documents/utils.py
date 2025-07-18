from documents.models import Document
from django.utils.dateparse import parse_datetime 
from django.utils.functional import SimpleLazyObject
def import_documents_from_1c(json_list, creator):

    for item in json_list:
        if isinstance(creator, SimpleLazyObject):
            creator = creator._wrapped
        print("Type:", type(item))
        guid = item.get("GUID")
        print("GUID:", guid)
        if not guid:
            print("No GUID found, skipping item:", item)
            continue  # пропускаем без GUID
        print("Creating or updating:", {
            'creator': creator,
            'title': item.get("ЗРССсылка", ""),
            'doc_type': 'payment'
        })
        # Найдём или создадим документ
        doc, created = Document.objects.get_or_create(guid=guid, defaults={
            'creator': creator,
            'title': item.get("ЗРССсылка", ""),
            'doc_type': 'payment',
        })
        print("Created:", created, "Document ID:", doc.id)
        # Обновим поля
        doc.title = item.get("ЗРССсылка", "")
        doc.external_number = item.get("Номер", "")
        doc.status = item.get("Состояние", "pending")
        doc.amount = item.get("Сумма") or 0
        doc.recipient = item.get("Контрагент", "")
        doc.doc_type = 'payment'  # можно сделать динамически
        doc.created_at = parse_datetime(item.get("Дата")) or doc.created_at
        try:
            doc.save()
        except Exception as e:
            print(f"Error saving document {doc.id}: {e}")
            continue