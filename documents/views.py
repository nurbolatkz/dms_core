import json
import base64
from django.http import JsonResponse
import requests
from requests.auth import HTTPBasicAuth

from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from documents.utils import import_documents_from_1c
from django.utils.dateparse import parse_datetime 
from django.utils.functional import SimpleLazyObject
from documents.models import Document, Organization, User
from django.views.decorators.http import require_POST



STATUS_TRANSLATION_MAP = {
    "Подготовлен": "prepared",
    "На согласовании": "on_approval",
    "Утвержден": "approved",
    "Ожидает": "pending",
    "Подписан": "signed",
    "Отклонен": "rejected",
    # Add any other statuses from 1C that need mapping
}

@login_required
def document_list(request):
    documents = Document.objects.filter(creator=request.user)
    recipients = [
        {'id': 1, 'name': 'ООО "Поставщик"'},
        {'id': 2, 'name': 'ИП "Иванов"'},
        {'id': 3, 'name': 'ЗАО "Технологии"'}
    ]
    contracts_by_counterparty = {
    1: [  # ООО "Поставщик"
        {'id': 101, 'name': 'Договор поставки №1'},
        {'id': 102, 'name': 'Договор услуг'},
        {'id': 103, 'name': 'Доп. соглашение №A'}
    ],
    2: [  # ИП "Иванов"
        {'id': 201, 'name': 'Договор аренды оборудования'},
        {'id': 202, 'name': 'Договор сервисного обслуживания'}
    ],
    3: [  # ЗАО "Технологии"
        {'id': 301, 'name': 'Лицензионное соглашение'},
        {'id': 302, 'name': 'Контракт на разработку ПО'},
        {'id': 303, 'name': 'Договор сопровождения'}
    ]
    }
    try:
        selected_org = request.user.organization
        one_c_server_url = selected_org.server_address
        one_c_path = selected_org.path

     
        admin_login = "Администратор"
        admin_password = "ckfdbyf"

        userpass = f"{admin_login}:{admin_password}".encode("utf-8")
        basic_auth = base64.b64encode(userpass).decode("ascii")

        headers = {
            "Authorization": f"Basic {basic_auth}",
            "Content-Type": "application/json"
        }

        # --- 3. JSON-запрос на редирект ---
        address_path = f"http://localhost/{one_c_path}/hs/MobileExchange/PaymentList/false"

        json_body = {
            "Метод": "GET",
            "Адрес": address_path,
        }

        redirect_url = f"{one_c_server_url}hs/MobileExchange/redirection/"
        response = requests.post(redirect_url, json=json_body, headers=headers)
        #print("Redirect response:",response)

        if response.status_code != 200:
            messages.error(request, f"Ошибка получения документов из 1С: код {response.status_code}")
            one_c_documents = []
        else:
            try:
                one_c_documents = response.json()
                print(len(one_c_documents))
                for item in one_c_documents:
                    if isinstance(request.user, SimpleLazyObject):
                        creator = request.user._wrapped
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
                    if created:
                        print("Created:", created, "Document ID:", doc.id)
                    else:
                        print("Updated existing document:", doc.id)
                    
                    # Обновим поля
                    doc.title = item.get("ЗРССсылка", "")
                    doc.external_number = item.get("Номер", "")
                    one_c_status_russian = item.get("Состояние", "Ожидает") # Default to Russian "Ожидает"
                    translated_status = STATUS_TRANSLATION_MAP.get(one_c_status_russian, "prepared") 
                      
                    doc.status = translated_status
                    doc.amount = item.get("Сумма") or 0
                    doc.recipient = item.get("Контрагент", "")
                    doc.doc_type = 'payment'  # можно сделать динамически
                    doc.created_at = parse_datetime(item.get("Дата")) or doc.created_at
                    try:
                        doc.save()
                    except Exception as e:
                        print(f"Error saving document {doc.id}: {e}")
                        continue
                messages.success(request, "Документы успешно импортированы из 1С")
                print("Полученные документы из 1С:", one_c_documents)
            except json.JSONDecodeError:
                one_c_documents = []
                messages.error(request, "Неверный JSON-ответ от 1С")
    except Exception as e:
        one_c_documents = []
        messages.error(request, f"Ошибка при запросе к 1С: {e}")
        
    document_list = Document.objects.all().order_by('-created_at')  
    
    return render(request, 'documents/index.html', {
        'documents': document_list,
        'counterparties': recipients,
        'contracts_by_counterparty': contracts_by_counterparty,
        'one_c_documents': document_list,
   
    })

def login_view(request):
    organizations = Organization.objects.all()

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        organization_id = request.POST.get('organization')

        if not organization_id:
            messages.error(request, 'Пожалуйста, выберите организацию.')
            return render(request, 'registration/login.html', {'organizations': organizations})

        try:
            selected_org = Organization.objects.get(id=organization_id)
            
            # DEMO MODE: Skip 1C authentication for testing purposes
            # In production, this should be properly configured with real 1C server
            
            # --- Django Authentication ---
            try:
                user = User.objects.get(username=username)

                if user.organization != selected_org:
                    messages.error(request, 'Пользователь не принадлежит к выбранной организации.')
                    return render(request, 'registration/login.html', {'organizations': organizations})

                # Simple password check for demo
                if not user.check_password(password):
                    messages.error(request, 'Неверный пароль.')
                    return render(request, 'registration/login.html', {'organizations': organizations})

            except User.DoesNotExist:
                messages.error(request, 'Пользователь не найден. Свяжитесь с администратором.')
                return render(request, 'registration/login.html', {'organizations': organizations})

            login(request, user)
            return redirect(reverse('document_list'))

        except Organization.DoesNotExist:
            messages.error(request, 'Выбранная организация не найдена.')

        except requests.exceptions.ConnectionError:
            messages.error(request, 'Не удалось подключиться к серверу 1C. Проверьте адрес.')

        except requests.exceptions.Timeout:
            messages.error(request, 'Таймаут подключения к серверу 1C.')

        except requests.exceptions.RequestException as e:
            messages.error(request, f'Ошибка запроса к серверу 1C: {e}')

        except Exception as e:
            messages.error(request, f'Произошла непредвиденная ошибка: {e}')

    return render(request, 'registration/login.html', {'organizations': organizations})


@login_required
def document_detail_page(request, pk):
   
    doc = get_object_or_404(Document, pk=pk)

    # Prepare data for the template. This might include related objects
    # if you have them (e.g., doc.expenditure_request if that model existed).
    # For now, it uses fields directly on the Document model.
    doc_data = {
        'id': doc.id,
        'title': doc.title,
        'doc_type_display': doc.get_doc_type_display(), # Get human-readable type
        'status_raw': doc.status, # Raw status for JS functions
        'status_display': get_status_text_for_template(doc.status), # Human-readable status
        'description': doc.description,
        'creator_username': doc.creator.username,
        'signer_username': doc.signer.username if doc.signer else 'N/A',
        'guid': doc.guid,
        'external_number': doc.external_number,
        'created_at': doc.created_at.strftime("%d.%m.%Y %H:%M"), # Format datetime for display
        'updated_at': doc.updated_at.strftime("%d.%m.%Y %H:%M"),

        # Payment-specific fields
        'amount': str(doc.amount) if doc.amount is not None else None,
        'recipient': doc.recipient,
        
        # Leave-specific fields
        'start_date': doc.start_date.strftime("%d.%m.%Y") if doc.start_date else None,
        'end_date': doc.end_date.strftime("%d.%m.%Y") if doc.end_date else None,
        'leave_type': doc.leave_type,

        # Expenditure-specific fields (if you add the model later, populate them here)
        # For now, they will be None/N/A from the template
        'operation_type': None,
        'submission_date': None,
        'expense_date': None,
        'payment_form': None,
        'counterparty_name': None,
        'contract_name': None,
        'currency': None,
        'expenditure_amount': None, # Separate from general amount
        'comment': None, # Separate from general description
    }

    # If you later create the ExpenditureRequest model and link it,
    # you would fetch and populate its fields here:
    # if doc.doc_type == 'expenditure' and hasattr(doc, 'expenditure_request'):
    #     exp_req = doc.expenditure_request
    #     doc_data['operation_type'] = exp_req.operation_type
    #     doc_data['submission_date'] = exp_req.submission_date.strftime("%d.%m.%Y") if exp_req.submission_date else None
    #     doc_data['expense_date'] = exp_req.expense_date.strftime("%d.%m.%Y") if exp_req.expense_date else None
    #     doc_data['payment_form'] = exp_req.payment_form
    #     doc_data['counterparty_name'] = exp_req.counterparty.name if exp_req.counterparty else None
    #     doc_data['contract_name'] = exp_req.contract.name if exp_req.contract else None
    #     doc_data['currency'] = exp_req.currency
    #     doc_data['expenditure_amount'] = str(exp_req.amount) if exp_req.amount is not None else None
    #     doc_data['comment'] = exp_req.comment
    recipients = [
        {'id': 1, 'name': 'ООО "Поставщик"'},
        {'id': 2, 'name': 'ИП "Иванов"'},
        {'id': 3, 'name': 'ЗАО "Технологии"'}
    ]
    contracts_by_counterparty = {
    1: [  # ООО "Поставщик"
        {'id': 101, 'name': 'Договор поставки №1'},
        {'id': 102, 'name': 'Договор услуг'},
        {'id': 103, 'name': 'Доп. соглашение №A'}
    ],
    2: [  # ИП "Иванов"
        {'id': 201, 'name': 'Договор аренды оборудования'},
        {'id': 202, 'name': 'Договор сервисного обслуживания'}
    ],
    3: [  # ЗАО "Технологии"
        {'id': 301, 'name': 'Лицензионное соглашение'},
        {'id': 302, 'name': 'Контракт на разработку ПО'},
        {'id': 303, 'name': 'Договор сопровождения'}
    ]
    }
    
    document_list = Document.objects.all().order_by('-created_at')  
    
 
    return render(request, 'documents/document_detail.html', {'doc': doc_data, 'documents': document_list,
        'counterparties': recipients,
        'contracts_by_counterparty': contracts_by_counterparty,})

# Helper function for Django template to get status text (replicates JS logic)
def get_status_text_for_template(status):
    if status == 'pending': return 'Ожидает'
    elif status == 'signed': return 'Подписан'
    elif status == 'rejected': return 'Отклонен'
    else: return status

# Helper function for Django template to get status color class (replicates JS logic)
def get_status_color_class_for_template(status):
    if status == 'pending': return 'bg-yellow-200 text-yellow-800'
    elif status == 'signed': return 'bg-green-200 text-green-800'
    elif status == 'rejected': return 'bg-red-200 text-red-800'
    else: return 'bg-gray-200 text-gray-800'

# You would also need views for signing and rejecting (similar API structure)
@login_required
def sign_document_api(request, pk):
    if request.method == 'POST':
        doc = get_object_or_404(Document, pk=pk)
        if doc.signer == request.user and doc.status == 'pending':
            doc.status = 'signed'
            doc.save()
            return JsonResponse({'success': True, 'message': 'Document signed successfully.'})
        return JsonResponse({'success': False, 'message': 'Not authorized to sign or document not pending.'}, status=403)
    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)

@login_required
def reject_document_api(request, pk):
    if request.method == 'POST':
        doc = get_object_or_404(Document, pk=pk)
        if doc.signer == request.user and doc.status == 'pending':
            doc.status = 'rejected'
            doc.save()
            return JsonResponse({'success': True, 'message': 'Document rejected successfully.'})
        return JsonResponse({'success': False, 'message': 'Not authorized to reject or document not pending.'}, status=403)
    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)




@login_required
@require_POST
def send_created_new_doc(request):
    user = request.user
    org = getattr(user, 'organization', None)

    if not org:
        return JsonResponse({'error': 'Организация не найдена у пользователя.'}, status=400)

    try:
        body = json.loads(request.body)
        print("Request body:", body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Невалидный JSON.'}, status=400)

    doc_type = body.get('doc_type')
    title = body.get('title', '')
    description = body.get('description', '')

    payload = {
        'Заголовок': title,
        'Описание': description,
        'ТипДокумента': doc_type
    }

    # Расширение для конкретных типов
    if doc_type == 'payment':
        payload.update({
            'Сумма': body.get('amount', 0),
            'Получатель': body.get('recipient', '')
        })
    elif doc_type == 'leave':
        payload.update({
            'ДатаНачала': body.get('start_date'),
            'ДатаОкончания': body.get('end_date'),
            'ТипОтпуска': body.get('leave_type')
        })
    elif doc_type == 'expenditure':
        payload.update({
            'GUID':'',
             'Номер':"",
            'ВидОперации': body.get('operation_type'),
            'ДатаПодачи': body.get('submission_date'),
            'ДатаРасхода': body.get('expense_date'),
            'ФормаОплаты': body.get('payment_form','наличные'),
            "Контрагент": "59b4b2db-f27c-11ee-80bd-c412f533c9be",
            #'Договор': body.get('contract_id',""),
            'Договор': "",
            'Валюта': body.get('currency'),
            'Сумма': body.get('amount', 0),
            'Комментарий': body.get('comment', ''),
             'action': 'create',
             'Автор': user.username,
        })

    # 1. Подготовка доступа
    login_1c = 'Администратор'
    password_1c = 'ckfdbyf'

    userpass = f"{login_1c}:{password_1c}".encode("utf-8")
    basic_auth = base64.b64encode(userpass).decode("ascii")

    headers = {
        "Authorization": f"Basic {basic_auth}",
        "Content-Type": "application/json"
    }

    one_c_server_url = org.server_address
    one_c_path = org.path
    endpoint_url = f"http://localhost/{one_c_path}/hs/MobileExchange/PaymentRequest/test/"

    # 2. JSON-запрос на редирект
    redirect_body = {
        "Метод": "POST",
        "Адрес": endpoint_url,
       
        "ТелоЗапроса": payload
    }
    print("Redirect body:", redirect_body)
    redirect_url = f"{one_c_server_url}hs/MobileExchange/redirection/"
    try:
        redirect_response = requests.post(redirect_url, json=redirect_body, headers=headers)
          # Debugging: print raw response text to see what 1C actually sends
        print(f"DEBUG: 1C Redirect Response Status: {redirect_response.status_code}")
        print(f"DEBUG: 1C Redirect Response Headers: {redirect_response.headers}")
        print(f"DEBUG: 1C Redirect Response Text: {redirect_response.text}")
        if redirect_response.status_code != 200:
            return JsonResponse({
                'error': f'Ошибка на этапе редиректа в 1С: {redirect_response.status_code}',
                'details': redirect_response.text
            }, status=500)

        result = redirect_response.json()
        print("Redirect response:", result) 
        # можно здесь сохранить в базу, если нужно:
        Document.objects.create(
            title=title,
            description=description,
            doc_type=doc_type,
            creator=user,
            status='pending'
        )

        return JsonResponse({'success': True, 'response': result})

    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': f'Ошибка соединения с 1С: {str(e)}'}, status=500)